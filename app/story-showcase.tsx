"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";

const stories = [
  {name:"Academy",verb:"Learn",title:"Turn practice into proof.",description:"Work on real briefs, receive useful feedback, and build a record of what you can do.",image:"/brand/academy.jpg",href:"/academy",detail:"Practice → feedback → evidence"},
  {name:"Studio",verb:"Build",title:"Give ideas the right shape.",description:"Discover the problem, validate the direction, and build useful software with intention.",image:"/brand/studio.jpg",href:"/studio",detail:"Discovery → validation → delivery"},
  {name:"Business AI",verb:"Transform",title:"Make better work possible.",description:"Understand operations first, then redesign workflows and apply AI where it can help.",image:"/brand/consulting.jpg",href:"/business",detail:"Diagnosis → redesign → measure"},
];

export function StoryShowcase(){
  const [active,setActive]=useState(0);
  const [paused,setPaused]=useState(false);
  useEffect(()=>{
    if(paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer=window.setInterval(()=>{if(!document.hidden)setActive(v=>(v+1)%stories.length)},7200);
    return ()=>window.clearInterval(timer);
  },[paused]);
  const story=stories[active];
  const choose=(index:number)=>{setActive((index+stories.length)%stories.length);setPaused(true)};
  return <section className="story-section section-pad" aria-labelledby="story-heading">
    <div className="shell"><div className="section-heading" data-reveal><div><span className="eyebrow">03 / In motion</span><h2 className="display-title" id="story-heading">One direction. <span className="serif-accent">Three engines.</span></h2></div><p>Follow the work from learning to products to better operations.</p></div>
      <div className="story-frame" aria-roledescription="carousel" aria-label="DigitalBurj divisions">
        <div className="story-image-stack">{stories.map((item,i)=><div key={item.name} className={`story-image ${i===active?"is-active":""}`} style={{backgroundImage:`url('${item.image}')`}} role="img" aria-label={`${item.name}: an illustrative working scene`} aria-hidden={i!==active}/>)}</div>
        <div className="story-panel" key={story.name}><span className="story-count">0{active+1} <span>/ 0{stories.length}</span></span><span className="story-verb">{story.verb}</span><h3>{story.title}</h3><p>{story.description}</p><div className="story-detail">{story.detail}</div><Link href={story.href} className="story-action">Explore {story.name} <ArrowUpRight size={19}/></Link></div>
        <div className="story-controls"><button type="button" onClick={()=>choose(active-1)} aria-label="Previous story"><ArrowLeft size={20}/></button><div className="story-tabs" role="group" aria-label="Choose a story">{stories.map((item,i)=><button key={item.name} type="button" onClick={()=>choose(i)} className={i===active?"is-active":""} aria-label={`Show ${item.name}`} aria-current={i===active?"true":undefined}><span>0{i+1}</span>{item.name}<i/></button>)}</div><button type="button" onClick={()=>choose(active+1)} aria-label="Next story"><ArrowRight size={20}/></button><button type="button" onClick={()=>setPaused(v=>!v)} aria-label={paused?"Play story carousel":"Pause story carousel"}>{paused?<Play size={18}/>:<Pause size={18}/>}</button></div>
      </div>
    </div>
  </section>;
}
