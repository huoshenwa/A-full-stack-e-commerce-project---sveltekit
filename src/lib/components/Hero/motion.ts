import gsap from "gsap";
export const showTitle =  (id:string) =>{
    gsap.to(id, {y:-20, opacity: 1, delay: 2});
}
export const showBuy = (id:string)=>{
    gsap.to(id, {y:-20, opacity: 1, delay: 2})
}

