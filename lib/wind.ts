/** Shared wind state: written once per frame by the petals, read by the blossom-sway shader. */
export const windU={uTime:{value:0},uGust:{value:0},uAmp:{value:1}};
/** 0..1, slow rolling gusts. */
export const gustAt=(t:number)=>{const g=Math.sin(t*.35)*.6+Math.sin(t*.83+1)*.4;return Math.pow(Math.max(0,g),2)};