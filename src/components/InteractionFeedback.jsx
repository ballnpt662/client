import{useEffect}from'react';

export default function InteractionFeedback(){useEffect(()=>{const timers=new WeakMap(),press=e=>{const button=e.target.closest('button');if(!button||button.disabled)return;button.classList.remove('ui-pressed');void button.offsetWidth;button.classList.add('ui-pressed');clearTimeout(timers.get(button));timers.set(button,setTimeout(()=>button.classList.remove('ui-pressed'),420))};document.addEventListener('pointerdown',press);return()=>document.removeEventListener('pointerdown',press)},[]);return null}
