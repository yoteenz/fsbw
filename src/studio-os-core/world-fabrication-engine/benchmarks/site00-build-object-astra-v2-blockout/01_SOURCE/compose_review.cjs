// Deterministic 50% sRGB blend and labeled review evidence. Requires repository sharp.
const sharp=require('sharp'),fs=require('fs'),path=require('path');
const P=path.resolve(__dirname,'..'),w=1672,h=941;
const f=s=>path.join(P,s);
async function main(){
 const ref=await sharp(f('03_COMPARISONS/approved-reference.jpg')).removeAlpha().raw().toBuffer();
 const hero=await sharp(f('02_RENDERS/01_REFERENCE_CAMERA_BLOCKOUT.png')).removeAlpha().raw().toBuffer();
 if(ref.length!==hero.length)throw Error('Reference/render dimensions differ');
 const mix=Buffer.alloc(ref.length);for(let i=0;i<mix.length;i++)mix[i]=Math.round((ref[i]+hero[i])/2);
 await sharp(mix,{raw:{width:w,height:h,channels:3}}).png().toFile(f('02_RENDERS/05_REFERENCE_OVERLAY.png'));
 const heading=(text,width=w)=>Buffer.from(`<svg width="${width}" height="54"><rect width="100%" height="100%" fill="#f4f4f4"/><text x="24" y="35" font-family="sans-serif" font-size="23" fill="#151515">${text}</text></svg>`);
 await sharp({create:{width:w*2,height:h+54,channels:3,background:'white'}}).composite([{input:f('03_COMPARISONS/approved-reference.jpg'),left:0,top:54},{input:f('02_RENDERS/01_REFERENCE_CAMERA_BLOCKOUT.png'),left:w,top:54},{input:heading('APPROVED REFERENCE • GEOMETRY AUTHORITY'),left:0,top:0},{input:heading('STAGE 01 • DIAGNOSTIC BLOCKOUT • PENDING'),left:w,top:0}]).png().toFile(f('03_COMPARISONS/blockout-vs-reference-hero.png'));
 const report=JSON.parse(fs.readFileSync(f('04_DOCUMENTATION/camera-match-report.json')));
 let svg=`<svg width="${w}" height="${h}"><rect x="22" y="20" width="740" height="45" fill="white"/><text x="36" y="50" font-family="sans-serif" font-size="22">LANDMARK CHECK • GREEN reference / MAGENTA modeled</text>`;
 report.landmarks.forEach(l=>{let [x,y]=l.reference_px,[u,v]=l.projected_px;svg+=`<path d="M${x},${y} L${u},${v}" stroke="#111" stroke-width="2"/><circle cx="${x}" cy="${y}" r="8" fill="none" stroke="#00a852" stroke-width="3"/><path d="M${u-7},${v}h14 M${u},${v-7}v14" stroke="#d900cb" stroke-width="3"/>`;});svg+='</svg>';
 await sharp(f('02_RENDERS/05_REFERENCE_OVERLAY.png')).composite([{input:Buffer.from(svg)}]).png().toFile(f('03_COMPARISONS/landmark-overlay-hero.png'));
 let inputs=[];let views=['03_COMPARISONS/approved-reference.jpg','02_RENDERS/01_REFERENCE_CAMERA_BLOCKOUT.png','02_RENDERS/02_LEFT_THREE_QUARTER.png','02_RENDERS/03_RIGHT_THREE_QUARTER.png','02_RENDERS/04_ELEVATED_INSPECTION.png','02_RENDERS/05_REFERENCE_OVERLAY.png'];
 for(let i=0;i<views.length;i++){let col=i%2,row=Math.floor(i/2),label=['REFERENCE','01 • HERO / PERSPECTIVE','02 • LEFT THREE QUARTER','03 • RIGHT THREE QUARTER','04 • ELEVATED INSPECTION','05 • 50% OVERLAY'][i];inputs.push({input:await sharp(f(views[i])).resize(836,471).toBuffer(),left:col*836,top:row*510+39},{input:await sharp(heading(label)).resize(836,27).toBuffer(),left:col*836,top:row*510+6});}
 await sharp({create:{width:1672,height:1530,channels:3,background:'white'}}).composite(inputs).png().toFile(f('05_FOUNDER_REVIEW/review-contact-sheet.png'));
 console.log('Five views and comparisons complete');
}main().catch(e=>{console.error(e);process.exit(1)});
