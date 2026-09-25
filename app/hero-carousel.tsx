"use client";
import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
export type HeroFrame={src:string;label:string;position?:string};
export function HeroCarousel({frames,className=""}:{frames:HeroFrame[];className?:string}){
  const [active,setActive]=useState(0);
  const [paused,setPaused]=useState(false);
  useEffect(()=>{
    if(paused||frames.length<2||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    const timer=window.setInterval(()=>{if(!document.hidden)setActive(n=>(n+1)%frames.length)},6200);
    return ()=>window.clearInterval(timer);
  },[paused,frames.length]);
  return <div className={`cinema-carousel ${className}`} role="group" aria-label="DigitalBurj visual story">
    {frames.map((frame,i)=><div key={frame.src} className={`cinema-frame ${i===active?"active":""}`} style={{backgroundImage:`url('${frame.src}')`,backgroundPosition:frame.position||"center"}} aria-hidden="true"/>)}
    {frames.length>1&&<div className="cinema-controls"><span className="cinema-current" aria-live="polite">{String(active+1).padStart(2,"0")} <span>/</span> {String(frames.length).padStart(2,"0")} <span className="cinema-label">{frames[active].label}</span></span><div className="cinema-dots" aria-label="Choose hero scene">{frames.map((f,i)=><button key={f.src} type="button" onClick={()=>setActive(i)} className={i===active?"active":""} aria-label={`Show scene ${i+1}: ${f.label}`} aria-current={i===active?"true":undefined}/>)}</div><button type="button" className="cinema-pause" onClick={()=>setPaused(p=>!p)} aria-label={paused?"Play hero transitions":"Pause hero transitions"}>{paused?<Play size={15}/>:<Pause size={15}/>}</button></div>}
  </div>;
}
