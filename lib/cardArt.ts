import * as THREE from 'three';

/** One locally hosted painted atlas; labels stay sharp and separate from the artwork. */
export function paintedCard(image:HTMLImageElement,index:number,name:string,description:string,kanji:string){
  const c=document.createElement('canvas');c.width=512;c.height=768;
  const x=c.getContext('2d')!;
  x.drawImage(image,(index%3)*image.naturalWidth/3,Math.floor(index/3)*image.naturalHeight/2,image.naturalWidth/3,image.naturalHeight/2,0,0,512,768);
  const shade=x.createLinearGradient(0,380,0,768);
  shade.addColorStop(0,'transparent');shade.addColorStop(.5,'rgba(13,7,27,.8)');shade.addColorStop(1,'#0d071b');
  x.fillStyle=shade;x.fillRect(0,380,512,388);
  x.strokeStyle='#edd2a1';x.lineWidth=3;x.strokeRect(12,12,488,744);
  x.strokeStyle='rgba(255,210,224,.5)';x.lineWidth=1;x.strokeRect(22,22,468,724);
  x.fillStyle='rgba(20,10,30,.72)';x.fillRect(36,36,96,58);
  x.fillStyle='#ffe9ef';x.textAlign='center';x.font='600 30px "Shippori Mincho B1",serif';x.fillText(kanji,84,77,86);
  x.textAlign='left';x.fillStyle='#e9c987';x.font='500 18px "Space Grotesk",sans-serif';x.fillText(`0${index+1} / WORLD`,42,597);
  x.fillStyle='#fff3f6';x.font='800 52px "Shippori Mincho B1",serif';x.fillText(name,40,665,430);
  x.fillStyle='#f4c3d5';x.font='500 23px "Space Grotesk",sans-serif';x.fillText(description,42,710,425);
  const texture=new THREE.CanvasTexture(c);texture.anisotropy=4;return texture;
}
