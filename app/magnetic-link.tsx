"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { MouseEvent } from "react";
export function MagneticLink({href,children,className=""}:{href:string;children:React.ReactNode;className?:string}){
  function move(e:MouseEvent<HTMLAnchorElement>){
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(pointer: coarse)").matches) return;
    const rect=e.currentTarget.getBoundingClientRect();
    const x=(e.clientX-rect.left-rect.width/2)/rect.width*10;
    const y=(e.clientY-rect.top-rect.height/2)/rect.height*10;
    e.currentTarget.style.setProperty("--mag-x",`${x}px`);
    e.currentTarget.style.setProperty("--mag-y",`${y}px`);
  }
  function reset(e:MouseEvent<HTMLAnchorElement>){
    e.currentTarget.style.setProperty("--mag-x","0px");
    e.currentTarget.style.setProperty("--mag-y","0px");
  }
  return <Link href={href} onMouseMove={move} onMouseLeave={reset} className={`btn magnetic-cta ${className}`}>{children}<ArrowUpRight size={19}/></Link>;
}
