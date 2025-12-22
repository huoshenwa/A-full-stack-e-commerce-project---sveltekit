import  gsap from 'gsap'
export const showTitle = (id: string) => {
    gsap.to(id, { opacity: 1, y: 0 });
}
export const showLink = (className: string) => {
    gsap.to(className, { opacity: 1, y: 0, duration: 1, stagger: 0.25 });
}