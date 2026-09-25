"use client";
import { useEffect } from "react";
export function MotionLayer() {
  useEffect(()=>{
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ticking=false;
    const update=()=>{
      const available=document.documentElement.scrollHeight-window.innerHeight;
      document.documentElement.style.setProperty("--read-progress",`${available>0?window.scrollY/available*100:0}%`);
      ticking=false;
    };
    const onScroll=()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}};
    update();window.addEventListener("scroll",onScroll,{passive:true});window.addEventListener("resize",onScroll);
    const items=Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if(!("IntersectionObserver" in window)) return ()=>{window.removeEventListener("scroll",onScroll);window.removeEventListener("resize",onScroll)};
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries) if(entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    },{threshold:.12,rootMargin:"0px 0px -35px 0px"});
    for(const item of items) {
      if(item.getBoundingClientRect().top > window.innerHeight*.87) {
        item.classList.add("will-reveal");
        observer.observe(item);
      }
    }
    return ()=>{observer.disconnect();window.removeEventListener("scroll",onScroll);window.removeEventListener("resize",onScroll);document.documentElement.style.removeProperty("--read-progress")};
  },[]);
  return null;
}
