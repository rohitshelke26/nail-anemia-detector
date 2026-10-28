import { useRef, useState } from 'react'
import { ArrowRight, Camera, Check, ChevronRight, FlaskConical, Info, Layers3, Menu, Microscope, MoveUpRight, ScanLine, ShieldCheck, Sparkles, UploadCloud, X } from 'lucide-react'
import './App.css'

const disclaimer = 'NailSense AI is an experimental research project, not a medical device. This image classification cannot diagnose or rule out anemia. If you have symptoms or health concerns, consult a qualified healthcare professional.'
type Result = { predicted_class: string; experimental_score: number }

function Wordmark() { return <a className="wordmark" href="#top" aria-label="NailSense AI home"><span className="mark"><ScanLine size={19}/></span><span>nailsense <b>AI</b></span></a> }
function Disclaimer({compact=false}:{compact?:boolean}) { return <div className={`disclaimer ${compact?'compact':''}`}><Info size={20}/><p>{disclaimer}</p></div> }
function Button({children, href='#analyze', secondary=false, onClick}:{children:React.ReactNode; href?:string; secondary?:boolean; onClick?:()=>void}) { return <a className={`button ${secondary?'secondary':''}`} href={href} onClick={onClick}>{children}</a> }

function App() {
  const [menu, setMenu] = useState(false)
  const [file, setFile] = useState<File|null>(null)
  const [preview, setPreview] = useState('')
  const [drag, setDrag] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result|null>(null)
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const camera = useRef<HTMLInputElement>(null)
  const choose = (selected?: File) => {
    setError('')
    if (!selected) return
    if (!['image/jpeg','image/png','image/webp'].includes(selected.type)) { setError('Please choose a JPG, PNG, or WEBP image.'); return }
    if (selected.size > 10*1024*1024) { setError('Please choose an image smaller than 10 MB.'); return }
    setFile(selected); setPreview(URL.createObjectURL(selected)); setResult(null)
  }
  const remove = () => { setFile(null); setPreview(''); setResult(null); setError(''); if(input.current) input.current.value='' }
  const analyze = async () => {
    if (!file) { setError('Add an image before starting analysis.'); return }
    setLoading(true); setError('')
    const form = new FormData(); form.append('file', file)
    try {
      const response = await fetch('/api/analyze', {method:'POST', body:form})
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Analysis could not be completed.')
      setResult(data); setTimeout(() => document.getElementById('result')?.scrollIntoView({behavior:'smooth'}), 50)
    } catch (err) { setError(err instanceof Error ? err.message : 'Analysis could not be completed.') }
    finally { setLoading(false) }
  }

  return <div id="top">
    <header className="nav">
      <Wordmark />
      <button className="menu" aria-label="Toggle navigation" onClick={()=>setMenu(!menu)}><Menu/></button>
      <nav className={menu?'open':''}>
        <a href="#science" onClick={()=>setMenu(false)}>Science</a><a href="#how" onClick={()=>setMenu(false)}>How it works</a><a href="#responsibility" onClick={()=>setMenu(false)}>Responsibility</a>
        <Button href="#analyze" onClick={()=>setMenu(false)}>Analyze an image <ArrowRight size={16}/></Button>
      </nav>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy reveal">
          <div className="eyebrow"><span></span> EXPERIMENTAL AI RESEARCH</div>
          <h1>A closer look at <em>fingernail</em> imagery.</h1>
          <p className="lead">Explore an experimental image classification model designed to observe patterns in fingernail photography—not to make medical judgments.</p>
          <div className="actions"><Button href="#analyze">Analyze an Image <ArrowRight size={18}/></Button><Button href="#science" secondary>Explore the Science <MoveUpRight size={17}/></Button></div>
          <div className="hero-meta"><span><ShieldCheck size={16}/> Privacy-first upload</span><span><FlaskConical size={16}/> Research prototype</span></div>
        </div>
        <div className="hero-art reveal delay" aria-label="NailSense analysis preview">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="science-tag"><span>224</span><small>PX MODEL INPUT</small></div>
          <div className="photo-frame">
            <div className="photo-top"><span>SPECIMEN 01</span><span className="live-dot"></span></div>
            <div className="hand-image"><div className="finger"><i></i></div><div className="scan-line"></div></div>
            <div className="photo-coordinates">03.47° N&nbsp;&nbsp; / &nbsp;&nbsp;IMAGE PLANE 01</div>
          </div>
          <div className="analysis-card"><div><span>Experimental analysis</span><strong>Image ready</strong></div><div className="mini-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span className="status-check"><Check size={14}/></span></div>
        </div>
      </section>
      <div className="landing-disclaimer"><Disclaimer compact /></div>

      <section className="feature-intro" id="science">
        <div><span className="section-kicker">THE EXPLORATION</span><h2>Seeing a familiar detail<br/>in a new way.</h2></div>
        <p>We translate visual research into a calm, transparent experience. NailSense is built to help you explore a model—not replace clinical insight.</p>
      </section>
      <section className="features">
        <article><div className="feature-icon"><Microscope/></div><div><span>01</span><h3>Image-based exploration</h3><p>Upload a clear fingernail image and observe how a trained convolutional model interprets its visual features.</p></div></article>
        <article><div className="feature-icon"><Layers3/></div><div><span>02</span><h3>A simple path to insight</h3><p>Move from image to experimental classification in one focused, accessible workflow.</p></div></article>
        <article id="responsibility"><div className="feature-icon"><ShieldCheck/></div><div><span>03</span><h3>Transparent, responsible AI</h3><p>Every output is contextualized as experimental, with clear limits and encouragement to seek qualified care.</p></div></article>
      </section>

      <section className="workflow" aria-label="Analysis workflow">
        <div className="workflow-heading"><span>ONE INTENTIONAL FLOW</span><p>From image to perspective,<br/><em>with no hidden steps.</em></p></div>
        {['Upload Image','Model Analysis','Review Result'].map((x,i)=><div className="flow-step" key={x}><div className="flow-number">0{i+1}</div><div className="flow-icon">{i===0?<UploadCloud/>:i===1?<Sparkles/>:<ScanLine/>}</div><h3>{x}</h3>{i<2&&<ChevronRight className="flow-arrow"/>}</div>)}
      </section>

      <section className="how" id="how"><div className="how-heading"><span className="section-kicker">HOW IT WORKS</span><h2>Three steps.<br/>One clear result.</h2></div><div className="steps">
        <article><b>01</b><div><h3>Prepare your image</h3><p>Use a well-lit, in-focus photograph of a fingernail against a plain background.</p></div></article>
        <article><b>02</b><div><h3>Let the model observe</h3><p>Your image is resized and passed through the NailSense experimental CNN.</p></div></article>
        <article><b>03</b><div><h3>Review the context</h3><p>Consider the classification and score together, then read the important medical context.</p></div></article>
      </div></section>

      <section className="analyze-section" id="analyze">
        <div className="workspace-heading"><div><span className="section-kicker">ANALYSIS WORKSPACE</span><h2>Explore a fingernail image.</h2><p>Add one clear image to begin. Your upload is sent directly to the experimental model.</p></div><div className="secure-pill"><ShieldCheck size={17}/> Experimental workspace</div></div>
        <div className="workspace">
          <div className={`upload-zone ${drag?'dragging':''} ${preview?'has-preview':''}`} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);choose(e.dataTransfer.files[0])}}>
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>choose(e.target.files?.[0])} hidden/>
            {!preview ? <><div className="upload-icon"><UploadCloud/></div><h3>Drop your image here</h3><p>or choose a file from your device</p><button className="button" onClick={()=>input.current?.click()}><UploadCloud size={17}/> Choose image</button><small>JPG, PNG or WEBP · Maximum 10 MB</small></> : <><img src={preview} alt="Selected fingernail preview"/><div className="preview-actions"><button onClick={()=>input.current?.click()}>Replace</button><button onClick={remove}><X size={15}/> Remove</button></div></>}
          </div>
          <aside className="upload-guide"><span>CAMERA CAPTURE</span><p>On a supported device, capture a photo directly.</p><input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={e=>choose(e.target.files?.[0])}/><button className="camera-button" onClick={()=>camera.current?.click()}><Camera size={18}/> Use camera</button><hr/><p className="tip"><Info size={16}/> For the clearest input, use natural light and keep the nail in focus.</p></aside>
        </div>
        {error&&<div className="toast" role="alert"><Info size={18}/>{error}<button aria-label="Dismiss" onClick={()=>setError('')}><X size={16}/></button></div>}
        <div className="analyze-action"><Disclaimer/><button className="button analyze-button" onClick={analyze} disabled={loading}>{loading?<><span className="spinner"></span>Analyzing image...</>:<>Analyze Image <ArrowRight size={18}/></>}</button></div>
      </section>

      {result&&<section className="result-section" id="result"><div className="result-heading"><span className="section-kicker">EXPERIMENTAL RESULT</span><h2>Your image analysis.</h2></div><div className="result-grid">
        <div className="result-image"><img src={preview} alt="Analyzed fingernail"/><span>IMAGE REVIEWED</span></div>
        <div className="result-content"><span className="result-label">PREDICTED CLASS</span><h3>{result.predicted_class}</h3><div className="score-label"><span>Experimental model score</span><strong>{Math.round(result.experimental_score*100)}%</strong></div><div className="score-track"><i style={{width:`${result.experimental_score*100}%`}}></i></div><p>This score reflects the confidence of the current model output, not a medical finding. It should be interpreted only within this experimental context.</p></div>
      </div><div className="meaning"><Info/><div><h3>What this result means</h3><p>A machine learning model has classified the visual pattern as {result.predicted_class}. This output is limited by image quality, the model's training data, and its experimental purpose. A Non-Anemic result is not proof of good health.</p></div></div><Disclaimer/><div className="result-actions"><a className="button" href="#analyze" onClick={remove}>Analyze another image <ArrowRight size={18}/></a><a className="button secondary" href="#top">Return home</a></div></section>}
    </main>
    <footer><Wordmark/><p>Experimental imaging research · Designed for thoughtful exploration</p></footer>
  </div>
}
export default App
