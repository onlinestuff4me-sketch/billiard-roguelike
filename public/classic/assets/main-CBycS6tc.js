import{T as It,F as jt,I as qi,P as be,R as _n,A as De,a as bt,b as Si,c as $e,d as ee,e as di,E as Gc,f as ui,B as fi,m as vl,r as Nh,s as Fh,g as Oh,h as zh,i as zt,j as Qt,C as Yr,l as Bh,k as Do,n as xn}from"./lessons-BCb7FyUK.js";const Io="185",kh=0,Ml=1,Gh=2,Mr=1,Hh=2,Ps=3,Mn=0,ai=1,Bt=2,Vi=0,es=1,_t=2,Sl=3,yl=4,Vh=5,Rn=100,Wh=101,Xh=102,qh=103,Yh=104,$h=200,Zh=201,Kh=202,Jh=203,Ua=204,Na=205,Qh=206,jh=207,eu=208,tu=209,iu=210,nu=211,su=212,ru=213,au=214,Fa=0,Oa=1,za=2,rs=3,Ba=4,ka=5,Ga=6,Ha=7,Hc=0,ou=1,lu=2,Li=0,Uo=1,No=2,Fo=3,Oo=4,zo=5,Bo=6,ko=7,Vc=300,Dn=301,as=302,$r=303,Zr=304,Or=306,Va=1e3,en=1001,Wa=1002,Wt=1003,cu=1004,Xs=1005,Zt=1006,Kr=1007,Pn=1008,pi=1009,Wc=1010,Xc=1011,Us=1012,Go=1013,Xi=1014,Gi=1015,mi=1016,Ho=1017,Vo=1018,Ns=1020,qc=35902,Yc=35899,$c=1021,Zc=1022,Ci=1023,rn=1026,Ln=1027,Kc=1028,Wo=1029,In=1030,Xo=1031,qo=1033,Sr=33776,yr=33777,br=33778,Er=33779,Xa=35840,qa=35841,Ya=35842,$a=35843,Za=36196,Ka=37492,Ja=37496,Qa=37488,ja=37489,Ar=37490,eo=37491,to=37808,io=37809,no=37810,so=37811,ro=37812,ao=37813,oo=37814,lo=37815,co=37816,ho=37817,uo=37818,fo=37819,po=37820,mo=37821,go=36492,_o=36494,xo=36495,vo=36283,Mo=36284,Rr=36285,So=36286,hu=3200,yo=0,uu=1,mn="",vi="srgb",Cr="srgb-linear",Pr="linear",nt="srgb",Bn=7680,bl=519,du=512,fu=513,pu=514,Yo=515,mu=516,gu=517,$o=518,_u=519,El=35044,Tl="300 es",Hi=2e3,Fs=2001;function xu(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Lr(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function vu(){const n=Lr("canvas");return n.style.display="block",n}const wl={};function Al(...n){const e="THREE."+n.shift();console.log(e,...n)}function Jc(n){const e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Ie(...n){n=Jc(n);const e="THREE."+n.shift();{const t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function Qe(...n){n=Jc(n);const e="THREE."+n.shift();{const t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function ts(...n){const e=n.join(" ");e in wl||(wl[e]=!0,Ie(...n))}function Mu(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}const Su={[Fa]:Oa,[za]:Ga,[Ba]:Ha,[rs]:ka,[Oa]:Fa,[Ga]:za,[Ha]:Ba,[ka]:rs};class Nn{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const s=i[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const Yt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Jr=Math.PI/180,bo=180/Math.PI;function zs(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Yt[n&255]+Yt[n>>8&255]+Yt[n>>16&255]+Yt[n>>24&255]+"-"+Yt[e&255]+Yt[e>>8&255]+"-"+Yt[e>>16&15|64]+Yt[e>>24&255]+"-"+Yt[t&63|128]+Yt[t>>8&255]+"-"+Yt[t>>16&255]+Yt[t>>24&255]+Yt[i&255]+Yt[i>>8&255]+Yt[i>>16&255]+Yt[i>>24&255]).toLowerCase()}function Ze(n,e,t){return Math.max(e,Math.min(t,n))}function yu(n,e){return(n%e+e)%e}function Qr(n,e,t){return(1-t)*n+t*e}function xs(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function ii(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const rl=class rl{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ze(this.x,e.x,t.x),this.y=Ze(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ze(this.x,e,t),this.y=Ze(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ze(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Ze(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*i-a*s+e.x,this.y=r*s+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};rl.prototype.isVector2=!0;let Ue=rl;class fs{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,a,o){let l=i[s+0],c=i[s+1],u=i[s+2],d=i[s+3],h=r[a+0],p=r[a+1],_=r[a+2],v=r[a+3];if(d!==v||l!==h||c!==p||u!==_){let m=l*h+c*p+u*_+d*v;m<0&&(h=-h,p=-p,_=-_,v=-v,m=-m);let f=1-o;if(m<.9995){const T=Math.acos(m),R=Math.sin(T);f=Math.sin(f*T)/R,o=Math.sin(o*T)/R,l=l*f+h*o,c=c*f+p*o,u=u*f+_*o,d=d*f+v*o}else{l=l*f+h*o,c=c*f+p*o,u=u*f+_*o,d=d*f+v*o;const T=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=T,c*=T,u*=T,d*=T}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,s,r,a){const o=i[s],l=i[s+1],c=i[s+2],u=i[s+3],d=r[a],h=r[a+1],p=r[a+2],_=r[a+3];return e[t]=o*_+u*d+l*p-c*h,e[t+1]=l*_+u*h+c*d-o*p,e[t+2]=c*_+u*p+o*h-l*d,e[t+3]=u*_-o*d-l*h-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),u=o(s/2),d=o(r/2),h=l(i/2),p=l(s/2),_=l(r/2);switch(a){case"XYZ":this._x=h*u*d+c*p*_,this._y=c*p*d-h*u*_,this._z=c*u*_+h*p*d,this._w=c*u*d-h*p*_;break;case"YXZ":this._x=h*u*d+c*p*_,this._y=c*p*d-h*u*_,this._z=c*u*_-h*p*d,this._w=c*u*d+h*p*_;break;case"ZXY":this._x=h*u*d-c*p*_,this._y=c*p*d+h*u*_,this._z=c*u*_+h*p*d,this._w=c*u*d-h*p*_;break;case"ZYX":this._x=h*u*d-c*p*_,this._y=c*p*d+h*u*_,this._z=c*u*_-h*p*d,this._w=c*u*d+h*p*_;break;case"YZX":this._x=h*u*d+c*p*_,this._y=c*p*d+h*u*_,this._z=c*u*_-h*p*d,this._w=c*u*d-h*p*_;break;case"XZY":this._x=h*u*d-c*p*_,this._y=c*p*d-h*u*_,this._z=c*u*_+h*p*d,this._w=c*u*d+h*p*_;break;default:Ie("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],d=t[10],h=i+o+d;if(h>0){const p=.5/Math.sqrt(h+1);this._w=.25/p,this._x=(u-l)*p,this._y=(r-c)*p,this._z=(a-s)*p}else if(i>o&&i>d){const p=2*Math.sqrt(1+i-o-d);this._w=(u-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+c)/p}else if(o>d){const p=2*Math.sqrt(1+o-i-d);this._w=(r-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+u)/p}else{const p=2*Math.sqrt(1+d-i-o);this._w=(a-s)/p,this._x=(r+c)/p,this._y=(l+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ze(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=i*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-i*c,this._z=r*u+a*c+i*l-s*o,this._w=a*u-i*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const al=class al{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Rl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Rl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*i),u=2*(o*t-r*s),d=2*(r*i-a*t);return this.x=t+l*c+a*d-o*u,this.y=i+l*u+o*c-r*d,this.z=s+l*d+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ze(this.x,e.x,t.x),this.y=Ze(this.y,e.y,t.y),this.z=Ze(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ze(this.x,e,t),this.y=Ze(this.y,e,t),this.z=Ze(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ze(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-i*l,this.z=i*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return jr.copy(this).projectOnVector(e),this.sub(jr)}reflect(e){return this.sub(jr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Ze(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};al.prototype.isVector3=!0;let I=al;const jr=new I,Rl=new fs,ol=class ol{constructor(e,t,i,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c)}set(e,t,i,s,r,a,o,l,c){const u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=i,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],u=i[4],d=i[7],h=i[2],p=i[5],_=i[8],v=s[0],m=s[3],f=s[6],T=s[1],R=s[4],S=s[7],E=s[2],b=s[5],P=s[8];return r[0]=a*v+o*T+l*E,r[3]=a*m+o*R+l*b,r[6]=a*f+o*S+l*P,r[1]=c*v+u*T+d*E,r[4]=c*m+u*R+d*b,r[7]=c*f+u*S+d*P,r[2]=h*v+p*T+_*E,r[5]=h*m+p*R+_*b,r[8]=h*f+p*S+_*P,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-i*r*u+i*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],d=u*a-o*c,h=o*l-u*r,p=c*r-a*l,_=t*d+i*h+s*p;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/_;return e[0]=d*v,e[1]=(s*c-u*i)*v,e[2]=(o*i-s*a)*v,e[3]=h*v,e[4]=(u*t-s*l)*v,e[5]=(s*r-o*t)*v,e[6]=p*v,e[7]=(i*l-c*t)*v,e[8]=(a*t-i*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return ts("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(ea.makeScale(e,t)),this}rotate(e){return ts("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(ea.makeRotation(-e)),this}translate(e,t){return ts("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(ea.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};ol.prototype.isMatrix3=!0;let Fe=ol;const ea=new Fe,Cl=new Fe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Pl=new Fe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function bu(){const n={enabled:!0,workingColorSpace:Cr,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===nt&&(s.r=sn(s.r),s.g=sn(s.g),s.b=sn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===nt&&(s.r=is(s.r),s.g=is(s.g),s.b=is(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===mn?Pr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return ts("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return ts("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Cr]:{primaries:e,whitePoint:i,transfer:Pr,toXYZ:Cl,fromXYZ:Pl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:vi},outputColorSpaceConfig:{drawingBufferColorSpace:vi}},[vi]:{primaries:e,whitePoint:i,transfer:nt,toXYZ:Cl,fromXYZ:Pl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:vi}}}),n}const qe=bu();function sn(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function is(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let kn;class Eu{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{kn===void 0&&(kn=Lr("canvas")),kn.width=e.width,kn.height=e.height;const s=kn.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=kn}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Lr("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=sn(r[a]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(sn(t[i]/255)*255):t[i]=sn(t[i]);return{data:t,width:e.width,height:e.height}}else return Ie("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Tu=0;class Zo{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Tu++}),this.uuid=zs(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(ta(s[a].image)):r.push(ta(s[a]))}else r=ta(s);i.url=r}return t||(e.images[this.uuid]=i),i}}function ta(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Eu.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Ie("Texture: Unable to serialize Texture."),{})}let wu=0;const ia=new I;class ei extends Nn{constructor(e=ei.DEFAULT_IMAGE,t=ei.DEFAULT_MAPPING,i=en,s=en,r=Zt,a=Pn,o=Ci,l=pi,c=ei.DEFAULT_ANISOTROPY,u=mn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:wu++}),this.uuid=zs(),this.name="",this.source=new Zo(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ue(0,0),this.repeat=new Ue(1,1),this.center=new Ue(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Fe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(ia).x}get height(){return this.source.getSize(ia).y}get depth(){return this.source.getSize(ia).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){Ie(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Ie(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Vc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Va:e.x=e.x-Math.floor(e.x);break;case en:e.x=e.x<0?0:1;break;case Wa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Va:e.y=e.y-Math.floor(e.y);break;case en:e.y=e.y<0?0:1;break;case Wa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}ei.DEFAULT_IMAGE=null;ei.DEFAULT_MAPPING=Vc;ei.DEFAULT_ANISOTROPY=1;const ll=class ll{constructor(e=0,t=0,i=0,s=1){this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*i+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r;const l=e.elements,c=l[0],u=l[4],d=l[8],h=l[1],p=l[5],_=l[9],v=l[2],m=l[6],f=l[10];if(Math.abs(u-h)<.01&&Math.abs(d-v)<.01&&Math.abs(_-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+v)<.1&&Math.abs(_+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const R=(c+1)/2,S=(p+1)/2,E=(f+1)/2,b=(u+h)/4,P=(d+v)/4,x=(_+m)/4;return R>S&&R>E?R<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(R),s=b/i,r=P/i):S>E?S<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),i=b/s,r=x/s):E<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),i=P/r,s=x/r),this.set(i,s,r,t),this}let T=Math.sqrt((m-_)*(m-_)+(d-v)*(d-v)+(h-u)*(h-u));return Math.abs(T)<.001&&(T=1),this.x=(m-_)/T,this.y=(d-v)/T,this.z=(h-u)/T,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ze(this.x,e.x,t.x),this.y=Ze(this.y,e.y,t.y),this.z=Ze(this.z,e.z,t.z),this.w=Ze(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ze(this.x,e,t),this.y=Ze(this.y,e,t),this.z=Ze(this.z,e,t),this.w=Ze(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ze(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};ll.prototype.isVector4=!0;let xt=ll;class Au extends Nn{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Zt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new xt(0,0,e,t),this.scissorTest=!1,this.viewport=new xt(0,0,e,t),this.textures=[];const s={width:e,height:t,depth:i.depth},r=new ei(s),a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Zt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new Zo(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class oi extends Au{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Qc extends ei{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Wt,this.minFilter=Wt,this.wrapR=en,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Ru extends ei{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Wt,this.minFilter=Wt,this.wrapR=en,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Fr=class Fr{constructor(e,t,i,s,r,a,o,l,c,u,d,h,p,_,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c,u,d,h,p,_,v,m)}set(e,t,i,s,r,a,o,l,c,u,d,h,p,_,v,m){const f=this.elements;return f[0]=e,f[4]=t,f[8]=i,f[12]=s,f[1]=r,f[5]=a,f[9]=o,f[13]=l,f[2]=c,f[6]=u,f[10]=d,f[14]=h,f[3]=p,f[7]=_,f[11]=v,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Fr().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,i=e.elements,s=1/Gn.setFromMatrixColumn(e,0).length(),r=1/Gn.setFromMatrixColumn(e,1).length(),a=1/Gn.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,r=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){const h=a*u,p=a*d,_=o*u,v=o*d;t[0]=l*u,t[4]=-l*d,t[8]=c,t[1]=p+_*c,t[5]=h-v*c,t[9]=-o*l,t[2]=v-h*c,t[6]=_+p*c,t[10]=a*l}else if(e.order==="YXZ"){const h=l*u,p=l*d,_=c*u,v=c*d;t[0]=h+v*o,t[4]=_*o-p,t[8]=a*c,t[1]=a*d,t[5]=a*u,t[9]=-o,t[2]=p*o-_,t[6]=v+h*o,t[10]=a*l}else if(e.order==="ZXY"){const h=l*u,p=l*d,_=c*u,v=c*d;t[0]=h-v*o,t[4]=-a*d,t[8]=_+p*o,t[1]=p+_*o,t[5]=a*u,t[9]=v-h*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const h=a*u,p=a*d,_=o*u,v=o*d;t[0]=l*u,t[4]=_*c-p,t[8]=h*c+v,t[1]=l*d,t[5]=v*c+h,t[9]=p*c-_,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const h=a*l,p=a*c,_=o*l,v=o*c;t[0]=l*u,t[4]=v-h*d,t[8]=_*d+p,t[1]=d,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=p*d+_,t[10]=h-v*d}else if(e.order==="XZY"){const h=a*l,p=a*c,_=o*l,v=o*c;t[0]=l*u,t[4]=-d,t[8]=c*u,t[1]=h*d+v,t[5]=a*u,t[9]=p*d-_,t[2]=_*d-p,t[6]=o*u,t[10]=v*d+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Cu,e,Pu)}lookAt(e,t,i){const s=this.elements;return ci.subVectors(e,t),ci.lengthSq()===0&&(ci.z=1),ci.normalize(),cn.crossVectors(i,ci),cn.lengthSq()===0&&(Math.abs(i.z)===1?ci.x+=1e-4:ci.z+=1e-4,ci.normalize(),cn.crossVectors(i,ci)),cn.normalize(),qs.crossVectors(ci,cn),s[0]=cn.x,s[4]=qs.x,s[8]=ci.x,s[1]=cn.y,s[5]=qs.y,s[9]=ci.y,s[2]=cn.z,s[6]=qs.z,s[10]=ci.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],u=i[1],d=i[5],h=i[9],p=i[13],_=i[2],v=i[6],m=i[10],f=i[14],T=i[3],R=i[7],S=i[11],E=i[15],b=s[0],P=s[4],x=s[8],y=s[12],A=s[1],C=s[5],L=s[9],O=s[13],B=s[2],F=s[6],k=s[10],V=s[14],Q=s[3],te=s[7],se=s[11],pe=s[15];return r[0]=a*b+o*A+l*B+c*Q,r[4]=a*P+o*C+l*F+c*te,r[8]=a*x+o*L+l*k+c*se,r[12]=a*y+o*O+l*V+c*pe,r[1]=u*b+d*A+h*B+p*Q,r[5]=u*P+d*C+h*F+p*te,r[9]=u*x+d*L+h*k+p*se,r[13]=u*y+d*O+h*V+p*pe,r[2]=_*b+v*A+m*B+f*Q,r[6]=_*P+v*C+m*F+f*te,r[10]=_*x+v*L+m*k+f*se,r[14]=_*y+v*O+m*V+f*pe,r[3]=T*b+R*A+S*B+E*Q,r[7]=T*P+R*C+S*F+E*te,r[11]=T*x+R*L+S*k+E*se,r[15]=T*y+R*O+S*V+E*pe,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],d=e[6],h=e[10],p=e[14],_=e[3],v=e[7],m=e[11],f=e[15],T=l*p-c*h,R=o*p-c*d,S=o*h-l*d,E=a*p-c*u,b=a*h-l*u,P=a*d-o*u;return t*(v*T-m*R+f*S)-i*(_*T-m*E+f*b)+s*(_*R-v*E+f*P)-r*(_*S-v*b+m*P)}determinantAffine(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return t*(a*u-o*c)-i*(r*u-o*l)+s*(r*c-a*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],d=e[9],h=e[10],p=e[11],_=e[12],v=e[13],m=e[14],f=e[15],T=t*o-i*a,R=t*l-s*a,S=t*c-r*a,E=i*l-s*o,b=i*c-r*o,P=s*c-r*l,x=u*v-d*_,y=u*m-h*_,A=u*f-p*_,C=d*m-h*v,L=d*f-p*v,O=h*f-p*m,B=T*O-R*L+S*C+E*A-b*y+P*x;if(B===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const F=1/B;return e[0]=(o*O-l*L+c*C)*F,e[1]=(s*L-i*O-r*C)*F,e[2]=(v*P-m*b+f*E)*F,e[3]=(h*b-d*P-p*E)*F,e[4]=(l*A-a*O-c*y)*F,e[5]=(t*O-s*A+r*y)*F,e[6]=(m*S-_*P-f*R)*F,e[7]=(u*P-h*S+p*R)*F,e[8]=(a*L-o*A+c*x)*F,e[9]=(i*A-t*L-r*x)*F,e[10]=(_*b-v*S+f*T)*F,e[11]=(d*S-u*b-p*T)*F,e[12]=(o*y-a*C-l*x)*F,e[13]=(t*C-i*y+s*x)*F,e[14]=(v*R-_*E-m*T)*F,e[15]=(u*E-d*R+h*T)*F,this}scale(e){const t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),r=1-i,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+i,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+i,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,a){return this.set(1,i,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,d=o+o,h=r*c,p=r*u,_=r*d,v=a*u,m=a*d,f=o*d,T=l*c,R=l*u,S=l*d,E=i.x,b=i.y,P=i.z;return s[0]=(1-(v+f))*E,s[1]=(p+S)*E,s[2]=(_-R)*E,s[3]=0,s[4]=(p-S)*b,s[5]=(1-(h+f))*b,s[6]=(m+T)*b,s[7]=0,s[8]=(_+R)*P,s[9]=(m-T)*P,s[10]=(1-(h+v))*P,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let a=Gn.set(s[0],s[1],s[2]).length();const o=Gn.set(s[4],s[5],s[6]).length(),l=Gn.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Ei.copy(this);const c=1/a,u=1/o,d=1/l;return Ei.elements[0]*=c,Ei.elements[1]*=c,Ei.elements[2]*=c,Ei.elements[4]*=u,Ei.elements[5]*=u,Ei.elements[6]*=u,Ei.elements[8]*=d,Ei.elements[9]*=d,Ei.elements[10]*=d,t.setFromRotationMatrix(Ei),i.x=a,i.y=o,i.z=l,this}makePerspective(e,t,i,s,r,a,o=Hi,l=!1){const c=this.elements,u=2*r/(t-e),d=2*r/(i-s),h=(t+e)/(t-e),p=(i+s)/(i-s);let _,v;if(l)_=r/(a-r),v=a*r/(a-r);else if(o===Hi)_=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===Fs)_=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=d,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,s,r,a,o=Hi,l=!1){const c=this.elements,u=2/(t-e),d=2/(i-s),h=-(t+e)/(t-e),p=-(i+s)/(i-s);let _,v;if(l)_=1/(a-r),v=a/(a-r);else if(o===Hi)_=-2/(a-r),v=-(a+r)/(a-r);else if(o===Fs)_=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=d,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=_,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}};Fr.prototype.isMatrix4=!0;let gt=Fr;const Gn=new I,Ei=new gt,Cu=new I(0,0,0),Pu=new I(1,1,1),cn=new I,qs=new I,ci=new I,Ll=new gt,Dl=new fs;class Sn{constructor(e=0,t=0,i=0,s=Sn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],d=s[2],h=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(Ze(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ze(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ze(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ze(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Ze(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Ze(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,p),this._y=0);break;default:Ie("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Ll.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ll,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Dl.setFromEuler(this),this.setFromQuaternion(Dl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Sn.DEFAULT_ORDER="XYZ";class jc{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Lu=0;const Il=new I,Hn=new fs,Yi=new gt,Ys=new I,vs=new I,Du=new I,Iu=new fs,Ul=new I(1,0,0),Nl=new I(0,1,0),Fl=new I(0,0,1),Ol={type:"added"},Uu={type:"removed"},Vn={type:"childadded",child:null},na={type:"childremoved",child:null};class Gt extends Nn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Lu++}),this.uuid=zs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Gt.DEFAULT_UP.clone();const e=new I,t=new Sn,i=new fs,s=new I(1,1,1);function r(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new gt},normalMatrix:{value:new Fe}}),this.matrix=new gt,this.matrixWorld=new gt,this.matrixAutoUpdate=Gt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Gt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new jc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Hn.setFromAxisAngle(e,t),this.quaternion.multiply(Hn),this}rotateOnWorldAxis(e,t){return Hn.setFromAxisAngle(e,t),this.quaternion.premultiply(Hn),this}rotateX(e){return this.rotateOnAxis(Ul,e)}rotateY(e){return this.rotateOnAxis(Nl,e)}rotateZ(e){return this.rotateOnAxis(Fl,e)}translateOnAxis(e,t){return Il.copy(e).applyQuaternion(this.quaternion),this.position.add(Il.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ul,e)}translateY(e){return this.translateOnAxis(Nl,e)}translateZ(e){return this.translateOnAxis(Fl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Yi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Ys.copy(e):Ys.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),vs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Yi.lookAt(vs,Ys,this.up):Yi.lookAt(Ys,vs,this.up),this.quaternion.setFromRotationMatrix(Yi),s&&(Yi.extractRotation(s.matrixWorld),Hn.setFromRotationMatrix(Yi),this.quaternion.premultiply(Hn.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Qe("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ol),Vn.child=e,this.dispatchEvent(Vn),Vn.child=null):Qe("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Uu),na.child=e,this.dispatchEvent(na),na.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Yi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Yi.multiply(e.parent.matrixWorld)),e.applyMatrix4(Yi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ol),Vn.child=e,this.dispatchEvent(Vn),Vn.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vs,e,Du),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vs,Iu,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,i=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*s,r[13]+=i-r[1]*t-r[5]*i-r[9]*s,r[14]+=s-r[2]*t-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){const r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),d=a(e.shapes),h=a(e.skeletons),p=a(e.animations),_=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),d.length>0&&(i.shapes=d),h.length>0&&(i.skeletons=h),p.length>0&&(i.animations=p),_.length>0&&(i.nodes=_)}return i.object=s,i;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}Gt.DEFAULT_UP=new I(0,1,0);Gt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Gt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class ri extends Gt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Nu={type:"move"};class sa{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ri,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ri,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ri,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,i),f=this._getHandJoint(c,v);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}const u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],h=u.position.distanceTo(d.position),p=.02,_=.005;c.inputState.pinching&&h>p+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=p-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Nu)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new ri;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const eh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},hn={h:0,s:0,l:0},$s={h:0,s:0,l:0};function ra(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class Ce{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=vi){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,qe.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=qe.workingColorSpace){return this.r=e,this.g=t,this.b=i,qe.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=qe.workingColorSpace){if(e=yu(e,1),t=Ze(t,0,1),i=Ze(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,a=2*i-r;this.r=ra(a,r,e+1/3),this.g=ra(a,r,e),this.b=ra(a,r,e-1/3)}return qe.colorSpaceToWorking(this,s),this}setStyle(e,t=vi){function i(r){r!==void 0&&parseFloat(r)<1&&Ie("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ie("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Ie("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=vi){const i=eh[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Ie("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=sn(e.r),this.g=sn(e.g),this.b=sn(e.b),this}copyLinearToSRGB(e){return this.r=is(e.r),this.g=is(e.g),this.b=is(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=vi){return qe.workingToColorSpace($t.copy(this),e),Math.round(Ze($t.r*255,0,255))*65536+Math.round(Ze($t.g*255,0,255))*256+Math.round(Ze($t.b*255,0,255))}getHexString(e=vi){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=qe.workingColorSpace){qe.workingToColorSpace($t.copy(this),t);const i=$t.r,s=$t.g,r=$t.b,a=Math.max(i,s,r),o=Math.min(i,s,r);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const d=a-o;switch(c=u<=.5?d/(a+o):d/(2-a-o),a){case i:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-i)/d+2;break;case r:l=(i-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=qe.workingColorSpace){return qe.workingToColorSpace($t.copy(this),t),e.r=$t.r,e.g=$t.g,e.b=$t.b,e}getStyle(e=vi){qe.workingToColorSpace($t.copy(this),e);const t=$t.r,i=$t.g,s=$t.b;return e!==vi?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(hn),this.setHSL(hn.h+e,hn.s+t,hn.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(hn),e.getHSL($s);const i=Qr(hn.h,$s.h,t),s=Qr(hn.s,$s.s,t),r=Qr(hn.l,$s.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const $t=new Ce;Ce.NAMES=eh;class Fu extends Gt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Sn,this.environmentIntensity=1,this.environmentRotation=new Sn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const Ti=new I,$i=new I,aa=new I,Zi=new I,Wn=new I,Xn=new I,zl=new I,oa=new I,la=new I,ca=new I,ha=new xt,ua=new xt,da=new xt;class Ai{constructor(e=new I,t=new I,i=new I){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Ti.subVectors(e,t),s.cross(Ti);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){Ti.subVectors(s,t),$i.subVectors(i,t),aa.subVectors(e,t);const a=Ti.dot(Ti),o=Ti.dot($i),l=Ti.dot(aa),c=$i.dot($i),u=$i.dot(aa),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;const h=1/d,p=(c*l-o*u)*h,_=(a*u-o*l)*h;return r.set(1-p-_,_,p)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,Zi)===null?!1:Zi.x>=0&&Zi.y>=0&&Zi.x+Zi.y<=1}static getInterpolation(e,t,i,s,r,a,o,l){return this.getBarycoord(e,t,i,s,Zi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Zi.x),l.addScaledVector(a,Zi.y),l.addScaledVector(o,Zi.z),l)}static getInterpolatedAttribute(e,t,i,s,r,a){return ha.setScalar(0),ua.setScalar(0),da.setScalar(0),ha.fromBufferAttribute(e,t),ua.fromBufferAttribute(e,i),da.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(ha,r.x),a.addScaledVector(ua,r.y),a.addScaledVector(da,r.z),a}static isFrontFacing(e,t,i,s){return Ti.subVectors(i,t),$i.subVectors(e,t),Ti.cross($i).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ti.subVectors(this.c,this.b),$i.subVectors(this.a,this.b),Ti.cross($i).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Ai.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Ai.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return Ai.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return Ai.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Ai.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,r=this.c;let a,o;Wn.subVectors(s,i),Xn.subVectors(r,i),oa.subVectors(e,i);const l=Wn.dot(oa),c=Xn.dot(oa);if(l<=0&&c<=0)return t.copy(i);la.subVectors(e,s);const u=Wn.dot(la),d=Xn.dot(la);if(u>=0&&d<=u)return t.copy(s);const h=l*d-u*c;if(h<=0&&l>=0&&u<=0)return a=l/(l-u),t.copy(i).addScaledVector(Wn,a);ca.subVectors(e,r);const p=Wn.dot(ca),_=Xn.dot(ca);if(_>=0&&p<=_)return t.copy(r);const v=p*c-l*_;if(v<=0&&c>=0&&_<=0)return o=c/(c-_),t.copy(i).addScaledVector(Xn,o);const m=u*_-p*d;if(m<=0&&d-u>=0&&p-_>=0)return zl.subVectors(r,s),o=(d-u)/(d-u+(p-_)),t.copy(s).addScaledVector(zl,o);const f=1/(m+v+h);return a=v*f,o=h*f,t.copy(i).addScaledVector(Wn,a).addScaledVector(Xn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class Bs{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(wi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(wi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=wi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,wi):wi.fromBufferAttribute(r,a),wi.applyMatrix4(e.matrixWorld),this.expandByPoint(wi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Zs.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Zs.copy(i.boundingBox)),Zs.applyMatrix4(e.matrixWorld),this.union(Zs)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,wi),wi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ms),Ks.subVectors(this.max,Ms),qn.subVectors(e.a,Ms),Yn.subVectors(e.b,Ms),$n.subVectors(e.c,Ms),un.subVectors(Yn,qn),dn.subVectors($n,Yn),bn.subVectors(qn,$n);let t=[0,-un.z,un.y,0,-dn.z,dn.y,0,-bn.z,bn.y,un.z,0,-un.x,dn.z,0,-dn.x,bn.z,0,-bn.x,-un.y,un.x,0,-dn.y,dn.x,0,-bn.y,bn.x,0];return!fa(t,qn,Yn,$n,Ks)||(t=[1,0,0,0,1,0,0,0,1],!fa(t,qn,Yn,$n,Ks))?!1:(Js.crossVectors(un,dn),t=[Js.x,Js.y,Js.z],fa(t,qn,Yn,$n,Ks))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,wi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(wi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ki[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ki[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ki[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ki[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ki[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ki[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ki[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ki[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ki),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Ki=[new I,new I,new I,new I,new I,new I,new I,new I],wi=new I,Zs=new Bs,qn=new I,Yn=new I,$n=new I,un=new I,dn=new I,bn=new I,Ms=new I,Ks=new I,Js=new I,En=new I;function fa(n,e,t,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){En.fromArray(n,r);const o=s.x*Math.abs(En.x)+s.y*Math.abs(En.y)+s.z*Math.abs(En.z),l=e.dot(En),c=t.dot(En),u=i.dot(En);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const Lt=new I,Qs=new Ue;let Ou=0;class pt extends Nn{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Ou++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=El,this.updateRanges=[],this.gpuType=Gi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Qs.fromBufferAttribute(this,t),Qs.applyMatrix3(e),this.setXY(t,Qs.x,Qs.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Lt.fromBufferAttribute(this,t),Lt.applyMatrix3(e),this.setXYZ(t,Lt.x,Lt.y,Lt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Lt.fromBufferAttribute(this,t),Lt.applyMatrix4(e),this.setXYZ(t,Lt.x,Lt.y,Lt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Lt.fromBufferAttribute(this,t),Lt.applyNormalMatrix(e),this.setXYZ(t,Lt.x,Lt.y,Lt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Lt.fromBufferAttribute(this,t),Lt.transformDirection(e),this.setXYZ(t,Lt.x,Lt.y,Lt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=xs(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=ii(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=xs(t,this.array)),t}setX(e,t){return this.normalized&&(t=ii(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=xs(t,this.array)),t}setY(e,t){return this.normalized&&(t=ii(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=xs(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ii(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=xs(t,this.array)),t}setW(e,t){return this.normalized&&(t=ii(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=ii(t,this.array),i=ii(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=ii(t,this.array),i=ii(i,this.array),s=ii(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=ii(t,this.array),i=ii(i,this.array),s=ii(s,this.array),r=ii(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==El&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}}class th extends pt{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class ih extends pt{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class at extends pt{constructor(e,t,i){super(new Float32Array(e),t,i)}}const zu=new Bs,Ss=new I,pa=new I;class ks{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):zu.setFromPoints(e).getCenter(i);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ss.subVectors(e,this.center);const t=Ss.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Ss,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(pa.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ss.copy(e.center).add(pa)),this.expandByPoint(Ss.copy(e.center).sub(pa))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Bu=0;const _i=new gt,ma=new Gt,Zn=new I,hi=new Bs,ys=new Bs,Ot=new I;class st extends Nn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Bu++}),this.uuid=zs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(xu(e)?ih:th)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new Fe().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return _i.makeRotationFromQuaternion(e),this.applyMatrix4(_i),this}rotateX(e){return _i.makeRotationX(e),this.applyMatrix4(_i),this}rotateY(e){return _i.makeRotationY(e),this.applyMatrix4(_i),this}rotateZ(e){return _i.makeRotationZ(e),this.applyMatrix4(_i),this}translate(e,t,i){return _i.makeTranslation(e,t,i),this.applyMatrix4(_i),this}scale(e,t,i){return _i.makeScale(e,t,i),this.applyMatrix4(_i),this}lookAt(e){return ma.lookAt(e),ma.updateMatrix(),this.applyMatrix4(ma.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Zn).negate(),this.translate(Zn.x,Zn.y,Zn.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new at(i,3))}else{const i=Math.min(e.length,t.count);for(let s=0;s<i;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Ie("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Bs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Qe("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const r=t[i];hi.setFromBufferAttribute(r),this.morphTargetsRelative?(Ot.addVectors(this.boundingBox.min,hi.min),this.boundingBox.expandByPoint(Ot),Ot.addVectors(this.boundingBox.max,hi.max),this.boundingBox.expandByPoint(Ot)):(this.boundingBox.expandByPoint(hi.min),this.boundingBox.expandByPoint(hi.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Qe('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ks);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Qe("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){const i=this.boundingSphere.center;if(hi.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];ys.setFromBufferAttribute(o),this.morphTargetsRelative?(Ot.addVectors(hi.min,ys.min),hi.expandByPoint(Ot),Ot.addVectors(hi.max,ys.max),hi.expandByPoint(Ot)):(hi.expandByPoint(ys.min),hi.expandByPoint(ys.max))}hi.getCenter(i);let s=0;for(let r=0,a=e.count;r<a;r++)Ot.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Ot));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Ot.fromBufferAttribute(o,c),l&&(Zn.fromBufferAttribute(e,c),Ot.add(Zn)),s=Math.max(s,i.distanceToSquared(Ot))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Qe('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Qe("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,s=t.normal,r=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new pt(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));const o=[],l=[];for(let x=0;x<i.count;x++)o[x]=new I,l[x]=new I;const c=new I,u=new I,d=new I,h=new Ue,p=new Ue,_=new Ue,v=new I,m=new I;function f(x,y,A){c.fromBufferAttribute(i,x),u.fromBufferAttribute(i,y),d.fromBufferAttribute(i,A),h.fromBufferAttribute(r,x),p.fromBufferAttribute(r,y),_.fromBufferAttribute(r,A),u.sub(c),d.sub(c),p.sub(h),_.sub(h);const C=1/(p.x*_.y-_.x*p.y);isFinite(C)&&(v.copy(u).multiplyScalar(_.y).addScaledVector(d,-p.y).multiplyScalar(C),m.copy(d).multiplyScalar(p.x).addScaledVector(u,-_.x).multiplyScalar(C),o[x].add(v),o[y].add(v),o[A].add(v),l[x].add(m),l[y].add(m),l[A].add(m))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let x=0,y=T.length;x<y;++x){const A=T[x],C=A.start,L=A.count;for(let O=C,B=C+L;O<B;O+=3)f(e.getX(O+0),e.getX(O+1),e.getX(O+2))}const R=new I,S=new I,E=new I,b=new I;function P(x){E.fromBufferAttribute(s,x),b.copy(E);const y=o[x];R.copy(y),R.sub(E.multiplyScalar(E.dot(y))).normalize(),S.crossVectors(b,y);const C=S.dot(l[x])<0?-1:1;a.setXYZW(x,R.x,R.y,R.z,C)}for(let x=0,y=T.length;x<y;++x){const A=T[x],C=A.start,L=A.count;for(let O=C,B=C+L;O<B;O+=3)P(e.getX(O+0)),P(e.getX(O+1)),P(e.getX(O+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new pt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let h=0,p=i.count;h<p;h++)i.setXYZ(h,0,0,0);const s=new I,r=new I,a=new I,o=new I,l=new I,c=new I,u=new I,d=new I;if(e)for(let h=0,p=e.count;h<p;h+=3){const _=e.getX(h+0),v=e.getX(h+1),m=e.getX(h+2);s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,v),a.fromBufferAttribute(t,m),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),o.fromBufferAttribute(i,_),l.fromBufferAttribute(i,v),c.fromBufferAttribute(i,m),o.add(u),l.add(u),c.add(u),i.setXYZ(_,o.x,o.y,o.z),i.setXYZ(v,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,p=t.count;h<p;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),a.fromBufferAttribute(t,h+2),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),i.setXYZ(h+0,u.x,u.y,u.z),i.setXYZ(h+1,u.x,u.y,u.z),i.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Ot.fromBufferAttribute(e,t),Ot.normalize(),e.setXYZ(t,Ot.x,Ot.y,Ot.z)}toNonIndexed(){function e(o,l){const c=o.array,u=o.itemSize,d=o.normalized,h=new c.constructor(l.length*u);let p=0,_=0;for(let v=0,m=l.length;v<m;v++){o.isInterleavedBufferAttribute?p=l[v]*o.data.stride+o.offset:p=l[v]*u;for(let f=0;f<u;f++)h[_++]=c[p++]}return new pt(h,u,d)}if(this.index===null)return Ie("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new st,i=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,i);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let u=0,d=c.length;u<d;u++){const h=c[u],p=e(h,i);l.push(p)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let d=0,h=c.length;d<h;d++){const p=c[d];u.push(p.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const s=e.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(t))}const r=e.morphAttributes;for(const c in r){const u=[],d=r[c];for(let h=0,p=d.length;h<p;h++)u.push(d[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,u=a.length;c<u;c++){const d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}let ku=0;class Fn extends Nn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ku++}),this.uuid=zs(),this.name="",this.type="Material",this.blending=es,this.side=Mn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ua,this.blendDst=Na,this.blendEquation=Rn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ce(0,0,0),this.blendAlpha=0,this.depthFunc=rs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=bl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Bn,this.stencilZFail=Bn,this.stencilZPass=Bn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){Ie(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Ie(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==es&&(i.blending=this.blending),this.side!==Mn&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Ua&&(i.blendSrc=this.blendSrc),this.blendDst!==Na&&(i.blendDst=this.blendDst),this.blendEquation!==Rn&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==rs&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==bl&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Bn&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Bn&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Bn&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ce().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Ue().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ue().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const Ji=new I,ga=new I,js=new I,fn=new I,_a=new I,er=new I,xa=new I;class Ko{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ji)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Ji.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ji.copy(this.origin).addScaledVector(this.direction,t),Ji.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){ga.copy(e).add(t).multiplyScalar(.5),js.copy(t).sub(e).normalize(),fn.copy(this.origin).sub(ga);const r=e.distanceTo(t)*.5,a=-this.direction.dot(js),o=fn.dot(this.direction),l=-fn.dot(js),c=fn.lengthSq(),u=Math.abs(1-a*a);let d,h,p,_;if(u>0)if(d=a*l-o,h=a*o-l,_=r*u,d>=0)if(h>=-_)if(h<=_){const v=1/u;d*=v,h*=v,p=d*(d+a*h+2*o)+h*(a*d+h+2*l)+c}else h=r,d=Math.max(0,-(a*h+o)),p=-d*d+h*(h+2*l)+c;else h=-r,d=Math.max(0,-(a*h+o)),p=-d*d+h*(h+2*l)+c;else h<=-_?(d=Math.max(0,-(-a*r+o)),h=d>0?-r:Math.min(Math.max(-r,-l),r),p=-d*d+h*(h+2*l)+c):h<=_?(d=0,h=Math.min(Math.max(-r,-l),r),p=h*(h+2*l)+c):(d=Math.max(0,-(a*r+o)),h=d>0?r:Math.min(Math.max(-r,-l),r),p=-d*d+h*(h+2*l)+c);else h=a>0?-r:r,d=Math.max(0,-(a*h+o)),p=-d*d+h*(h+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(ga).addScaledVector(js,h),p}intersectSphere(e,t){Ji.subVectors(e.center,this.origin);const i=Ji.dot(this.direction),s=Ji.dot(Ji)-i*i,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return c>=0?(i=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(i=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,a=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,a=(e.min.y-h.y)*u),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(e.min.z-h.z)*d,l=(e.max.z-h.z)*d):(o=(e.max.z-h.z)*d,l=(e.min.z-h.z)*d),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,Ji)!==null}intersectTriangle(e,t,i,s,r){_a.subVectors(t,e),er.subVectors(i,e),xa.crossVectors(_a,er);let a=this.direction.dot(xa),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;fn.subVectors(this.origin,e);const l=o*this.direction.dot(er.crossVectors(fn,er));if(l<0)return null;const c=o*this.direction.dot(_a.cross(fn));if(c<0||l+c>a)return null;const u=-o*fn.dot(xa);return u<0?null:this.at(u/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class mt extends Fn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Sn,this.combine=Hc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Bl=new gt,Tn=new Ko,tr=new ks,kl=new I,ir=new I,nr=new I,sr=new I,va=new I,rr=new I,Gl=new I,ar=new I;class ke extends Gt{constructor(e=new st,t=new mt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){rr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=o[l],d=r[l];u!==0&&(va.fromBufferAttribute(d,e),a?rr.addScaledVector(va,u):rr.addScaledVector(va.sub(t),u))}t.add(rr)}return t}raycast(e,t){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),tr.copy(i.boundingSphere),tr.applyMatrix4(r),Tn.copy(e.ray).recast(e.near),!(tr.containsPoint(Tn.origin)===!1&&(Tn.intersectSphere(tr,kl)===null||Tn.origin.distanceToSquared(kl)>(e.far-e.near)**2))&&(Bl.copy(r).invert(),Tn.copy(e.ray).applyMatrix4(Bl),!(i.boundingBox!==null&&Tn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Tn)))}_computeIntersections(e,t,i){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,d=r.attributes.normal,h=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,v=h.length;_<v;_++){const m=h[_],f=a[m.materialIndex],T=Math.max(m.start,p.start),R=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let S=T,E=R;S<E;S+=3){const b=o.getX(S),P=o.getX(S+1),x=o.getX(S+2);s=or(this,f,e,i,c,u,d,b,P,x),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const _=Math.max(0,p.start),v=Math.min(o.count,p.start+p.count);for(let m=_,f=v;m<f;m+=3){const T=o.getX(m),R=o.getX(m+1),S=o.getX(m+2);s=or(this,a,e,i,c,u,d,T,R,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let _=0,v=h.length;_<v;_++){const m=h[_],f=a[m.materialIndex],T=Math.max(m.start,p.start),R=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let S=T,E=R;S<E;S+=3){const b=S,P=S+1,x=S+2;s=or(this,f,e,i,c,u,d,b,P,x),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const _=Math.max(0,p.start),v=Math.min(l.count,p.start+p.count);for(let m=_,f=v;m<f;m+=3){const T=m,R=m+1,S=m+2;s=or(this,a,e,i,c,u,d,T,R,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function Gu(n,e,t,i,s,r,a,o){let l;if(e.side===ai?l=i.intersectTriangle(a,r,s,!0,o):l=i.intersectTriangle(s,r,a,e.side===Mn,o),l===null)return null;ar.copy(o),ar.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(ar);return c<t.near||c>t.far?null:{distance:c,point:ar.clone(),object:n}}function or(n,e,t,i,s,r,a,o,l,c){n.getVertexPosition(o,ir),n.getVertexPosition(l,nr),n.getVertexPosition(c,sr);const u=Gu(n,e,t,i,ir,nr,sr,Gl);if(u){const d=new I;Ai.getBarycoord(Gl,ir,nr,sr,d),s&&(u.uv=Ai.getInterpolatedAttribute(s,o,l,c,d,new Ue)),r&&(u.uv1=Ai.getInterpolatedAttribute(r,o,l,c,d,new Ue)),a&&(u.normal=Ai.getInterpolatedAttribute(a,o,l,c,d,new I),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));const h={a:o,b:l,c,normal:new I,materialIndex:0};Ai.getNormal(ir,nr,sr,h.normal),u.face=h,u.barycoord=d}return u}class Hu extends ei{constructor(e=null,t=1,i=1,s,r,a,o,l,c=Wt,u=Wt,d,h){super(null,a,o,l,c,u,s,r,d,h),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Ma=new I,Vu=new I,Wu=new Fe;class An{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=Ma.subVectors(i,t).cross(Vu.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){const s=e.delta(Ma),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Wu.getNormalMatrix(e),s=this.coplanarPoint(Ma).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const wn=new ks,Xu=new Ue(.5,.5),lr=new I;class Jo{constructor(e=new An,t=new An,i=new An,s=new An,r=new An,a=new An){this.planes=[e,t,i,s,r,a]}set(e,t,i,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Hi,i=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],d=r[5],h=r[6],p=r[7],_=r[8],v=r[9],m=r[10],f=r[11],T=r[12],R=r[13],S=r[14],E=r[15];if(s[0].setComponents(c-a,p-u,f-_,E-T).normalize(),s[1].setComponents(c+a,p+u,f+_,E+T).normalize(),s[2].setComponents(c+o,p+d,f+v,E+R).normalize(),s[3].setComponents(c-o,p-d,f-v,E-R).normalize(),i)s[4].setComponents(l,h,m,S).normalize(),s[5].setComponents(c-l,p-h,f-m,E-S).normalize();else if(s[4].setComponents(c-l,p-h,f-m,E-S).normalize(),t===Hi)s[5].setComponents(c+l,p+h,f+m,E+S).normalize();else if(t===Fs)s[5].setComponents(l,h,m,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),wn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),wn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(wn)}intersectsSprite(e){wn.center.set(0,0,0);const t=Xu.distanceTo(e.center);return wn.radius=.7071067811865476+t,wn.applyMatrix4(e.matrixWorld),this.intersectsSphere(wn)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if(lr.x=s.normal.x>0?e.max.x:e.min.x,lr.y=s.normal.y>0?e.max.y:e.min.y,lr.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(lr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Ri extends Fn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ce(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Dr=new I,Ir=new I,Hl=new gt,bs=new Ko,cr=new ks,Sa=new I,Vl=new I;class Ur extends Gt{constructor(e=new st,t=new Ri){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)Dr.fromBufferAttribute(t,s-1),Ir.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=Dr.distanceTo(Ir);e.setAttribute("lineDistance",new at(i,1))}else Ie("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),cr.copy(i.boundingSphere),cr.applyMatrix4(s),cr.radius+=r,e.ray.intersectsSphere(cr)===!1)return;Hl.copy(s).invert(),bs.copy(e.ray).applyMatrix4(Hl);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=i.index,h=i.attributes.position;if(u!==null){const p=Math.max(0,a.start),_=Math.min(u.count,a.start+a.count);for(let v=p,m=_-1;v<m;v+=c){const f=u.getX(v),T=u.getX(v+1),R=hr(this,e,bs,l,f,T,v);R&&t.push(R)}if(this.isLineLoop){const v=u.getX(_-1),m=u.getX(p),f=hr(this,e,bs,l,v,m,_-1);f&&t.push(f)}}else{const p=Math.max(0,a.start),_=Math.min(h.count,a.start+a.count);for(let v=p,m=_-1;v<m;v+=c){const f=hr(this,e,bs,l,v,v+1,v);f&&t.push(f)}if(this.isLineLoop){const v=hr(this,e,bs,l,_-1,p,_-1);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function hr(n,e,t,i,s,r,a){const o=n.geometry.attributes.position;if(Dr.fromBufferAttribute(o,s),Ir.fromBufferAttribute(o,r),t.distanceSqToSegment(Dr,Ir,Sa,Vl)>i)return;Sa.applyMatrix4(n.matrixWorld);const c=e.ray.origin.distanceTo(Sa);if(!(c<e.near||c>e.far))return{distance:c,point:Vl.clone().applyMatrix4(n.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:n}}const Wl=new I,Xl=new I;class Is extends Ur{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let s=0,r=t.count;s<r;s+=2)Wl.fromBufferAttribute(t,s),Xl.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+Wl.distanceTo(Xl);e.setAttribute("lineDistance",new at(i,1))}else Ie("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Eo extends Ur{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class nh extends Fn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ce(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const ql=new gt,To=new Ko,ur=new ks,dr=new I;class qu extends Gt{constructor(e=new st,t=new nh){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),ur.copy(i.boundingSphere),ur.applyMatrix4(s),ur.radius+=r,e.ray.intersectsSphere(ur)===!1)return;ql.copy(s).invert(),To.copy(e.ray).applyMatrix4(ql);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,d=i.attributes.position;if(c!==null){const h=Math.max(0,a.start),p=Math.min(c.count,a.start+a.count);for(let _=h,v=p;_<v;_++){const m=c.getX(_);dr.fromBufferAttribute(d,m),Yl(dr,m,l,s,e,t,this)}}else{const h=Math.max(0,a.start),p=Math.min(d.count,a.start+a.count);for(let _=h,v=p;_<v;_++)dr.fromBufferAttribute(d,_),Yl(dr,_,l,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Yl(n,e,t,i,s,r,a){const o=To.distanceSqToPoint(n);if(o<t){const l=new I;To.closestPointToPoint(n,l),l.applyMatrix4(i);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class sh extends ei{constructor(e=[],t=Dn,i,s,r,a,o,l,c,u){super(e,t,i,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class os extends ei{constructor(e,t,i=Xi,s,r,a,o=Wt,l=Wt,c,u=rn,d=1){if(u!==rn&&u!==Ln)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:t,depth:d};super(h,s,r,a,o,l,u,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Zo(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Yu extends os{constructor(e,t=Xi,i=Dn,s,r,a=Wt,o=Wt,l,c=rn){const u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,i,s,r,a,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class rh extends ei{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Pi extends st{constructor(e=1,t=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],u=[],d=[];let h=0,p=0;_("z","y","x",-1,-1,i,t,e,a,r,0),_("z","y","x",1,-1,i,t,-e,a,r,1),_("x","z","y",1,1,e,i,t,s,a,2),_("x","z","y",1,-1,e,i,-t,s,a,3),_("x","y","z",1,-1,e,t,i,s,r,4),_("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new at(c,3)),this.setAttribute("normal",new at(u,3)),this.setAttribute("uv",new at(d,2));function _(v,m,f,T,R,S,E,b,P,x,y){const A=S/P,C=E/x,L=S/2,O=E/2,B=b/2,F=P+1,k=x+1;let V=0,Q=0;const te=new I;for(let se=0;se<k;se++){const pe=se*C-O;for(let ve=0;ve<F;ve++){const je=ve*A-L;te[v]=je*T,te[m]=pe*R,te[f]=B,c.push(te.x,te.y,te.z),te[v]=0,te[m]=0,te[f]=b>0?1:-1,u.push(te.x,te.y,te.z),d.push(ve/P),d.push(1-se/x),V+=1}}for(let se=0;se<x;se++)for(let pe=0;pe<P;pe++){const ve=h+pe+F*se,je=h+pe+F*(se+1),vt=h+(pe+1)+F*(se+1),et=h+(pe+1)+F*se;l.push(ve,je,et),l.push(je,vt,et),Q+=6}o.addGroup(p,Q,y),p+=Q,h+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Pi(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class Gs extends st{constructor(e=1,t=32,i=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:s},t=Math.max(3,t);const r=[],a=[],o=[],l=[],c=new I,u=new Ue;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let d=0,h=3;d<=t;d++,h+=3){const p=i+d/t*s;c.x=e*Math.cos(p),c.y=e*Math.sin(p),a.push(c.x,c.y,c.z),o.push(0,0,1),u.x=(a[h]/e+1)/2,u.y=(a[h+1]/e+1)/2,l.push(u.x,u.y)}for(let d=1;d<=t;d++)r.push(d,d+1,0);this.setIndex(r),this.setAttribute("position",new at(a,3)),this.setAttribute("normal",new at(o,3)),this.setAttribute("uv",new at(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Gs(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class vn extends st{constructor(e=1,t=1,i=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],d=[],h=[],p=[];let _=0;const v=[],m=i/2;let f=0;T(),a===!1&&(e>0&&R(!0),t>0&&R(!1)),this.setIndex(u),this.setAttribute("position",new at(d,3)),this.setAttribute("normal",new at(h,3)),this.setAttribute("uv",new at(p,2));function T(){const S=new I,E=new I;let b=0;const P=(t-e)/i;for(let x=0;x<=r;x++){const y=[],A=x/r,C=A*(t-e)+e;for(let L=0;L<=s;L++){const O=L/s,B=O*l+o,F=Math.sin(B),k=Math.cos(B);E.x=C*F,E.y=-A*i+m,E.z=C*k,d.push(E.x,E.y,E.z),S.set(F,P,k).normalize(),h.push(S.x,S.y,S.z),p.push(O,1-A),y.push(_++)}v.push(y)}for(let x=0;x<s;x++)for(let y=0;y<r;y++){const A=v[y][x],C=v[y+1][x],L=v[y+1][x+1],O=v[y][x+1];(e>0||y!==0)&&(u.push(A,C,O),b+=3),(t>0||y!==r-1)&&(u.push(C,L,O),b+=3)}c.addGroup(f,b,0),f+=b}function R(S){const E=_,b=new Ue,P=new I;let x=0;const y=S===!0?e:t,A=S===!0?1:-1;for(let L=1;L<=s;L++)d.push(0,m*A,0),h.push(0,A,0),p.push(.5,.5),_++;const C=_;for(let L=0;L<=s;L++){const B=L/s*l+o,F=Math.cos(B),k=Math.sin(B);P.x=y*k,P.y=m*A,P.z=y*F,d.push(P.x,P.y,P.z),h.push(0,A,0),b.x=F*.5+.5,b.y=k*.5*A+.5,p.push(b.x,b.y),_++}for(let L=0;L<s;L++){const O=E+L,B=C+L;S===!0?u.push(B,B+1,O):u.push(B+1,B,O),x+=3}c.addGroup(f,x,S===!0?1:2),f+=x}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new vn(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Un extends st{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(i),l=Math.floor(s),c=o+1,u=l+1,d=e/o,h=t/l,p=[],_=[],v=[],m=[];for(let f=0;f<u;f++){const T=f*h-a;for(let R=0;R<c;R++){const S=R*d-r;_.push(S,-T,0),v.push(0,0,1),m.push(R/o),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let T=0;T<o;T++){const R=T+c*f,S=T+c*(f+1),E=T+1+c*(f+1),b=T+1+c*f;p.push(R,S,b),p.push(S,E,b)}this.setIndex(p),this.setAttribute("position",new at(_,3)),this.setAttribute("normal",new at(v,3)),this.setAttribute("uv",new at(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Un(e.width,e.height,e.widthSegments,e.heightSegments)}}class Wi extends st{constructor(e=.5,t=1,i=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:a},i=Math.max(3,i),s=Math.max(1,s);const o=[],l=[],c=[],u=[];let d=e;const h=(t-e)/s,p=new I,_=new Ue;for(let v=0;v<=s;v++){for(let m=0;m<=i;m++){const f=r+m/i*a;p.x=d*Math.cos(f),p.y=d*Math.sin(f),l.push(p.x,p.y,p.z),c.push(0,0,1),_.x=(p.x/t+1)/2,_.y=(p.y/t+1)/2,u.push(_.x,_.y)}d+=h}for(let v=0;v<s;v++){const m=v*(i+1);for(let f=0;f<i;f++){const T=f+m,R=T,S=T+i+1,E=T+i+2,b=T+1;o.push(R,S,b),o.push(S,E,b)}}this.setIndex(o),this.setAttribute("position",new at(l,3)),this.setAttribute("normal",new at(c,3)),this.setAttribute("uv",new at(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Wi(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class ls extends st{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const l=Math.min(a+o,Math.PI);let c=0;const u=[],d=new I,h=new I,p=[],_=[],v=[],m=[];for(let f=0;f<=i;f++){const T=[],R=f/i,S=a+R*o,E=e*Math.cos(S),b=Math.sqrt(e*e-E*E);let P=0;f===0&&a===0?P=.5/t:f===i&&l===Math.PI&&(P=-.5/t);for(let x=0;x<=t;x++){const y=x/t,A=s+y*r;d.x=-b*Math.cos(A),d.y=E,d.z=b*Math.sin(A),_.push(d.x,d.y,d.z),h.copy(d).normalize(),v.push(h.x,h.y,h.z),m.push(y+P,1-R),T.push(c++)}u.push(T)}for(let f=0;f<i;f++)for(let T=0;T<t;T++){const R=u[f][T+1],S=u[f][T],E=u[f+1][T],b=u[f+1][T+1];(f!==0||a>0)&&p.push(R,S,b),(f!==i-1||l<Math.PI)&&p.push(S,E,b)}this.setIndex(p),this.setAttribute("position",new at(_,3)),this.setAttribute("normal",new at(v,3)),this.setAttribute("uv",new at(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ls(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Qo extends st{constructor(e=1,t=.4,i=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},i=Math.floor(i),s=Math.floor(s);const l=[],c=[],u=[],d=[],h=new I,p=new I,_=new I;for(let v=0;v<=i;v++){const m=a+v/i*o;for(let f=0;f<=s;f++){const T=f/s*r;p.x=(e+t*Math.cos(m))*Math.cos(T),p.y=(e+t*Math.cos(m))*Math.sin(T),p.z=t*Math.sin(m),c.push(p.x,p.y,p.z),h.x=e*Math.cos(T),h.y=e*Math.sin(T),_.subVectors(p,h).normalize(),u.push(_.x,_.y,_.z),d.push(f/s),d.push(v/i)}}for(let v=1;v<=i;v++)for(let m=1;m<=s;m++){const f=(s+1)*v+m-1,T=(s+1)*(v-1)+m-1,R=(s+1)*(v-1)+m,S=(s+1)*v+m;l.push(f,T,S),l.push(T,R,S)}this.setIndex(l),this.setAttribute("position",new at(c,3)),this.setAttribute("normal",new at(u,3)),this.setAttribute("uv",new at(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Qo(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}function cs(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const s=n[t][i];if($l(s))s.isRenderTargetTexture?(Ie("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone();else if(Array.isArray(s))if($l(s[0])){const r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][i]=r}else e[t][i]=s.slice();else e[t][i]=s}}return e}function Jt(n){const e={};for(let t=0;t<n.length;t++){const i=cs(n[t]);for(const s in i)e[s]=i[s]}return e}function $l(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function $u(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function ah(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:qe.workingColorSpace}const Os={clone:cs,merge:Jt};var Zu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Ku=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Kt extends Fn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Zu,this.fragmentShader=Ku,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=cs(e.uniforms),this.uniformsGroups=$u(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const i in e.uniforms){const s=e.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=t[s.value]||null;break;case"c":this.uniforms[i].value=new Ce().setHex(s.value);break;case"v2":this.uniforms[i].value=new Ue().fromArray(s.value);break;case"v3":this.uniforms[i].value=new I().fromArray(s.value);break;case"v4":this.uniforms[i].value=new xt().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Fe().fromArray(s.value);break;case"m4":this.uniforms[i].value=new gt().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class oh extends Kt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Bi extends Fn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ce(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ce(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=yo,this.normalScale=new Ue(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Sn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Ju extends Fn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=hu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Qu extends Fn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class jo extends Gt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ce(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}const ya=new gt,Zl=new I,Kl=new I;class lh{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ue(512,512),this.mapType=pi,this.map=null,this.mapPass=null,this.matrix=new gt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Jo,this._frameExtents=new Ue(1,1),this._viewportCount=1,this._viewports=[new xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;Zl.setFromMatrixPosition(e.matrixWorld),t.position.copy(Zl),Kl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Kl),t.updateMatrixWorld(),ya.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ya,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===Fs||t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(ya)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const fr=new I,pr=new fs,Fi=new I;class ch extends Gt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new gt,this.projectionMatrix=new gt,this.projectionMatrixInverse=new gt,this.coordinateSystem=Hi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(fr,pr,Fi),Fi.x===1&&Fi.y===1&&Fi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(fr,pr,Fi.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(fr,pr,Fi),Fi.x===1&&Fi.y===1&&Fi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(fr,pr,Fi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const pn=new I,Jl=new Ue,Ql=new Ue;class Mi extends ch{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=bo*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Jr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return bo*2*Math.atan(Math.tan(Jr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){pn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(pn.x,pn.y).multiplyScalar(-e/pn.z),pn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(pn.x,pn.y).multiplyScalar(-e/pn.z)}getViewSize(e,t){return this.getViewBounds(e,Jl,Ql),t.subVectors(Ql,Jl)}setViewOffset(e,t,i,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Jr*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*i/c,s*=a.width/l,i*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class ju extends lh{constructor(){super(new Mi(90,1,.5,500)),this.isPointLightShadow=!0}}class jl extends jo{constructor(e,t,i=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new ju}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class Hs extends ch{constructor(e=-1,t=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,a=i+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class ed extends lh{constructor(){super(new Hs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class td extends jo{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Gt.DEFAULT_UP),this.updateMatrix(),this.target=new Gt,this.shadow=new ed}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class id extends jo{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}const Kn=-90,Jn=1;class nd extends Gt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Mi(Kn,Jn,e,t);s.layers=this.layers,this.add(s);const r=new Mi(Kn,Jn,e,t);r.layers=this.layers,this.add(r);const a=new Mi(Kn,Jn,e,t);a.layers=this.layers,this.add(a);const o=new Mi(Kn,Jn,e,t);o.layers=this.layers,this.add(o);const l=new Mi(Kn,Jn,e,t);l.layers=this.layers,this.add(l);const c=new Mi(Kn,Jn,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===Hi)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Fs)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,u]=this.children,d=e.getRenderTarget(),h=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;const v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(i,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(i,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),i.texture.generateMipmaps=v,e.setRenderTarget(i,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(d,h,p),e.xr.enabled=_,i.texture.needsPMREMUpdate=!0}}class sd extends Mi{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class rd{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=ad.bind(this),e.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e!==void 0?e:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}}function ad(){this._document.hidden===!1&&this.reset()}const cl=class cl{constructor(e,t,i,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,s){const r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=s,this}};cl.prototype.isMatrix2=!0;let ec=cl;function tc(n,e,t,i){const s=od(i);switch(t){case $c:return n*e;case Kc:return n*e/s.components*s.byteLength;case Wo:return n*e/s.components*s.byteLength;case In:return n*e*2/s.components*s.byteLength;case Xo:return n*e*2/s.components*s.byteLength;case Zc:return n*e*3/s.components*s.byteLength;case Ci:return n*e*4/s.components*s.byteLength;case qo:return n*e*4/s.components*s.byteLength;case Sr:case yr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case br:case Er:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case qa:case $a:return Math.max(n,16)*Math.max(e,8)/4;case Xa:case Ya:return Math.max(n,8)*Math.max(e,8)/2;case Za:case Ka:case Qa:case ja:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Ja:case Ar:case eo:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case to:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case io:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case no:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case so:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case ro:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case ao:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case oo:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case lo:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case co:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case ho:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case uo:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case fo:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case po:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case mo:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case go:case _o:case xo:return Math.ceil(n/4)*Math.ceil(e/4)*16;case vo:case Mo:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Rr:case So:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function od(n){switch(n){case pi:case Wc:return{byteLength:1,components:1};case Us:case Xc:case mi:return{byteLength:2,components:1};case Ho:case Vo:return{byteLength:2,components:4};case Xi:case Go:case Gi:return{byteLength:4,components:1};case qc:case Yc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Io}}));typeof window<"u"&&(window.__THREE__?Ie("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Io);function hh(){let n=null,e=!1,t=null,i=null;function s(r,a){t(r,a),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function ld(n){const e=new WeakMap;function t(o,l){const c=o.array,u=o.usage,d=c.byteLength,h=n.createBuffer();n.bindBuffer(l,h),n.bufferData(l,c,u),o.onUploadCallback();let p;if(c instanceof Float32Array)p=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=n.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=n.HALF_FLOAT:p=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=n.SHORT;else if(c instanceof Uint32Array)p=n.UNSIGNED_INT;else if(c instanceof Int32Array)p=n.INT;else if(c instanceof Int8Array)p=n.BYTE;else if(c instanceof Uint8Array)p=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function i(o,l,c){const u=l.array,d=l.updateRanges;if(n.bindBuffer(c,o),d.length===0)n.bufferSubData(c,0,u);else{d.sort((p,_)=>p.start-_.start);let h=0;for(let p=1;p<d.length;p++){const _=d[h],v=d[p];v.start<=_.start+_.count+1?_.count=Math.max(_.count,v.start+v.count-_.start):(++h,d[h]=v)}d.length=h+1;for(let p=0,_=d.length;p<_;p++){const v=d[p];n.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(n.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var cd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,hd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ud=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,dd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,fd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,pd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,md=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,gd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,_d=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,xd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,vd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Md=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Sd=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,yd=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Ed=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Td=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,wd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Ad=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Rd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Cd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Pd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Ld=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Dd=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Id=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Ud=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Nd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Fd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Od=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,zd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Bd="gl_FragColor = linearToOutputTexel( gl_FragColor );",kd=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Gd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Hd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Vd=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Wd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Xd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,qd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Yd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,$d=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Zd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Kd=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Jd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Qd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,jd=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,ef=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,tf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,nf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,sf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,rf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,af=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,of=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lf=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,cf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,hf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,uf=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,df=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,ff=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,pf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,mf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,gf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,_f=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,xf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,vf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Mf=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Sf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,yf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,bf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Ef=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Tf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,wf=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Af=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Rf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Cf=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Pf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Lf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Df=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,If=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Uf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Nf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Ff=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Of=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,zf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Bf=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,kf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Gf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Hf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Vf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Wf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Xf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,qf=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Yf=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,$f=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Zf=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Kf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Jf=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Qf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,jf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,ep=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,tp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,ip=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,np=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,sp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,rp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,ap=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,op=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,lp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,cp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const hp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,up=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,fp=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,pp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,mp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,gp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,_p=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,xp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,vp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Mp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Sp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,bp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ep=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Tp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ap=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Rp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Cp=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Pp=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Lp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Dp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ip=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Up=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Np=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Op=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zp=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Bp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,kp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Gp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Hp=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Vp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ge={alphahash_fragment:cd,alphahash_pars_fragment:hd,alphamap_fragment:ud,alphamap_pars_fragment:dd,alphatest_fragment:fd,alphatest_pars_fragment:pd,aomap_fragment:md,aomap_pars_fragment:gd,batching_pars_vertex:_d,batching_vertex:xd,begin_vertex:vd,beginnormal_vertex:Md,bsdfs:Sd,iridescence_fragment:yd,bumpmap_pars_fragment:bd,clipping_planes_fragment:Ed,clipping_planes_pars_fragment:Td,clipping_planes_pars_vertex:wd,clipping_planes_vertex:Ad,color_fragment:Rd,color_pars_fragment:Cd,color_pars_vertex:Pd,color_vertex:Ld,common:Dd,cube_uv_reflection_fragment:Id,defaultnormal_vertex:Ud,displacementmap_pars_vertex:Nd,displacementmap_vertex:Fd,emissivemap_fragment:Od,emissivemap_pars_fragment:zd,colorspace_fragment:Bd,colorspace_pars_fragment:kd,envmap_fragment:Gd,envmap_common_pars_fragment:Hd,envmap_pars_fragment:Vd,envmap_pars_vertex:Wd,envmap_physical_pars_fragment:tf,envmap_vertex:Xd,fog_vertex:qd,fog_pars_vertex:Yd,fog_fragment:$d,fog_pars_fragment:Zd,gradientmap_pars_fragment:Kd,lightmap_pars_fragment:Jd,lights_lambert_fragment:Qd,lights_lambert_pars_fragment:jd,lights_pars_begin:ef,lights_toon_fragment:nf,lights_toon_pars_fragment:sf,lights_phong_fragment:rf,lights_phong_pars_fragment:af,lights_physical_fragment:of,lights_physical_pars_fragment:lf,lights_fragment_begin:cf,lights_fragment_maps:hf,lights_fragment_end:uf,lightprobes_pars_fragment:df,logdepthbuf_fragment:ff,logdepthbuf_pars_fragment:pf,logdepthbuf_pars_vertex:mf,logdepthbuf_vertex:gf,map_fragment:_f,map_pars_fragment:xf,map_particle_fragment:vf,map_particle_pars_fragment:Mf,metalnessmap_fragment:Sf,metalnessmap_pars_fragment:yf,morphinstance_vertex:bf,morphcolor_vertex:Ef,morphnormal_vertex:Tf,morphtarget_pars_vertex:wf,morphtarget_vertex:Af,normal_fragment_begin:Rf,normal_fragment_maps:Cf,normal_pars_fragment:Pf,normal_pars_vertex:Lf,normal_vertex:Df,normalmap_pars_fragment:If,clearcoat_normal_fragment_begin:Uf,clearcoat_normal_fragment_maps:Nf,clearcoat_pars_fragment:Ff,iridescence_pars_fragment:Of,opaque_fragment:zf,packing:Bf,premultiplied_alpha_fragment:kf,project_vertex:Gf,dithering_fragment:Hf,dithering_pars_fragment:Vf,roughnessmap_fragment:Wf,roughnessmap_pars_fragment:Xf,shadowmap_pars_fragment:qf,shadowmap_pars_vertex:Yf,shadowmap_vertex:$f,shadowmask_pars_fragment:Zf,skinbase_vertex:Kf,skinning_pars_vertex:Jf,skinning_vertex:Qf,skinnormal_vertex:jf,specularmap_fragment:ep,specularmap_pars_fragment:tp,tonemapping_fragment:ip,tonemapping_pars_fragment:np,transmission_fragment:sp,transmission_pars_fragment:rp,uv_pars_fragment:ap,uv_pars_vertex:op,uv_vertex:lp,worldpos_vertex:cp,background_vert:hp,background_frag:up,backgroundCube_vert:dp,backgroundCube_frag:fp,cube_vert:pp,cube_frag:mp,depth_vert:gp,depth_frag:_p,distance_vert:xp,distance_frag:vp,equirect_vert:Mp,equirect_frag:Sp,linedashed_vert:yp,linedashed_frag:bp,meshbasic_vert:Ep,meshbasic_frag:Tp,meshlambert_vert:wp,meshlambert_frag:Ap,meshmatcap_vert:Rp,meshmatcap_frag:Cp,meshnormal_vert:Pp,meshnormal_frag:Lp,meshphong_vert:Dp,meshphong_frag:Ip,meshphysical_vert:Up,meshphysical_frag:Np,meshtoon_vert:Fp,meshtoon_frag:Op,points_vert:zp,points_frag:Bp,shadow_vert:kp,shadow_frag:Gp,sprite_vert:Hp,sprite_frag:Vp},fe={common:{diffuse:{value:new Ce(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Fe}},envmap:{envMap:{value:null},envMapRotation:{value:new Fe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Fe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Fe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Fe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Fe},normalScale:{value:new Ue(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Fe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Fe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Fe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Fe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ce(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new I},probesMax:{value:new I},probesResolution:{value:new I}},points:{diffuse:{value:new Ce(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0},uvTransform:{value:new Fe}},sprite:{diffuse:{value:new Ce(16777215)},opacity:{value:1},center:{value:new Ue(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}}},zi={basic:{uniforms:Jt([fe.common,fe.specularmap,fe.envmap,fe.aomap,fe.lightmap,fe.fog]),vertexShader:Ge.meshbasic_vert,fragmentShader:Ge.meshbasic_frag},lambert:{uniforms:Jt([fe.common,fe.specularmap,fe.envmap,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.fog,fe.lights,{emissive:{value:new Ce(0)},envMapIntensity:{value:1}}]),vertexShader:Ge.meshlambert_vert,fragmentShader:Ge.meshlambert_frag},phong:{uniforms:Jt([fe.common,fe.specularmap,fe.envmap,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.fog,fe.lights,{emissive:{value:new Ce(0)},specular:{value:new Ce(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphong_vert,fragmentShader:Ge.meshphong_frag},standard:{uniforms:Jt([fe.common,fe.envmap,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.roughnessmap,fe.metalnessmap,fe.fog,fe.lights,{emissive:{value:new Ce(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag},toon:{uniforms:Jt([fe.common,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.gradientmap,fe.fog,fe.lights,{emissive:{value:new Ce(0)}}]),vertexShader:Ge.meshtoon_vert,fragmentShader:Ge.meshtoon_frag},matcap:{uniforms:Jt([fe.common,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.fog,{matcap:{value:null}}]),vertexShader:Ge.meshmatcap_vert,fragmentShader:Ge.meshmatcap_frag},points:{uniforms:Jt([fe.points,fe.fog]),vertexShader:Ge.points_vert,fragmentShader:Ge.points_frag},dashed:{uniforms:Jt([fe.common,fe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ge.linedashed_vert,fragmentShader:Ge.linedashed_frag},depth:{uniforms:Jt([fe.common,fe.displacementmap]),vertexShader:Ge.depth_vert,fragmentShader:Ge.depth_frag},normal:{uniforms:Jt([fe.common,fe.bumpmap,fe.normalmap,fe.displacementmap,{opacity:{value:1}}]),vertexShader:Ge.meshnormal_vert,fragmentShader:Ge.meshnormal_frag},sprite:{uniforms:Jt([fe.sprite,fe.fog]),vertexShader:Ge.sprite_vert,fragmentShader:Ge.sprite_frag},background:{uniforms:{uvTransform:{value:new Fe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ge.background_vert,fragmentShader:Ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Fe}},vertexShader:Ge.backgroundCube_vert,fragmentShader:Ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ge.cube_vert,fragmentShader:Ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ge.equirect_vert,fragmentShader:Ge.equirect_frag},distance:{uniforms:Jt([fe.common,fe.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ge.distance_vert,fragmentShader:Ge.distance_frag},shadow:{uniforms:Jt([fe.lights,fe.fog,{color:{value:new Ce(0)},opacity:{value:1}}]),vertexShader:Ge.shadow_vert,fragmentShader:Ge.shadow_frag}};zi.physical={uniforms:Jt([zi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Fe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Fe},clearcoatNormalScale:{value:new Ue(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Fe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Fe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Fe},sheen:{value:0},sheenColor:{value:new Ce(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Fe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Fe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Fe},transmissionSamplerSize:{value:new Ue},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Fe},attenuationDistance:{value:0},attenuationColor:{value:new Ce(0)},specularColor:{value:new Ce(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Fe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Fe},anisotropyVector:{value:new Ue},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Fe}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag};const mr={r:0,b:0,g:0},Wp=new gt,uh=new Fe;uh.set(-1,0,0,0,1,0,0,0,1);function Xp(n,e,t,i,s,r){const a=new Ce(0);let o=s===!0?0:1,l,c,u=null,d=0,h=null;function p(T){let R=T.isScene===!0?T.background:null;if(R&&R.isTexture){const S=T.backgroundBlurriness>0;R=e.get(R,S)}return R}function _(T){let R=!1;const S=p(T);S===null?m(a,o):S&&S.isColor&&(m(S,1),R=!0);const E=n.xr.getEnvironmentBlendMode();E==="additive"?t.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(n.autoClear||R)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function v(T,R){const S=p(R);S&&(S.isCubeTexture||S.mapping===Or)?(c===void 0&&(c=new ke(new Pi(1,1,1),new Kt({name:"BackgroundCubeMaterial",uniforms:cs(zi.backgroundCube.uniforms),vertexShader:zi.backgroundCube.vertexShader,fragmentShader:zi.backgroundCube.fragmentShader,side:ai,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,b,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=S,c.material.uniforms.backgroundBlurriness.value=R.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=R.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Wp.makeRotationFromEuler(R.backgroundRotation)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(uh),c.material.toneMapped=qe.getTransfer(S.colorSpace)!==nt,(u!==S||d!==S.version||h!==n.toneMapping)&&(c.material.needsUpdate=!0,u=S,d=S.version,h=n.toneMapping),c.layers.enableAll(),T.unshift(c,c.geometry,c.material,0,0,null)):S&&S.isTexture&&(l===void 0&&(l=new ke(new Un(2,2),new Kt({name:"BackgroundMaterial",uniforms:cs(zi.background.uniforms),vertexShader:zi.background.vertexShader,fragmentShader:zi.background.fragmentShader,side:Mn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=S,l.material.uniforms.backgroundIntensity.value=R.backgroundIntensity,l.material.toneMapped=qe.getTransfer(S.colorSpace)!==nt,S.matrixAutoUpdate===!0&&S.updateMatrix(),l.material.uniforms.uvTransform.value.copy(S.matrix),(u!==S||d!==S.version||h!==n.toneMapping)&&(l.material.needsUpdate=!0,u=S,d=S.version,h=n.toneMapping),l.layers.enableAll(),T.unshift(l,l.geometry,l.material,0,0,null))}function m(T,R){T.getRGB(mr,ah(n)),t.buffers.color.setClear(mr.r,mr.g,mr.b,R,r)}function f(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(T,R=1){a.set(T),o=R,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(T){o=T,m(a,o)},render:_,addToRenderList:v,dispose:f}}function qp(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=h(null);let r=s,a=!1;function o(C,L,O,B,F){let k=!1;const V=d(C,B,O,L);r!==V&&(r=V,c(r.object)),k=p(C,B,O,F),k&&_(C,B,O,F),F!==null&&e.update(F,n.ELEMENT_ARRAY_BUFFER),(k||a)&&(a=!1,S(C,L,O,B),F!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(F).buffer))}function l(){return n.createVertexArray()}function c(C){return n.bindVertexArray(C)}function u(C){return n.deleteVertexArray(C)}function d(C,L,O,B){const F=B.wireframe===!0;let k=i[L.id];k===void 0&&(k={},i[L.id]=k);const V=C.isInstancedMesh===!0?C.id:0;let Q=k[V];Q===void 0&&(Q={},k[V]=Q);let te=Q[O.id];te===void 0&&(te={},Q[O.id]=te);let se=te[F];return se===void 0&&(se=h(l()),te[F]=se),se}function h(C){const L=[],O=[],B=[];for(let F=0;F<t;F++)L[F]=0,O[F]=0,B[F]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:O,attributeDivisors:B,object:C,attributes:{},index:null}}function p(C,L,O,B){const F=r.attributes,k=L.attributes;let V=0;const Q=O.getAttributes();for(const te in Q)if(Q[te].location>=0){const pe=F[te];let ve=k[te];if(ve===void 0&&(te==="instanceMatrix"&&C.instanceMatrix&&(ve=C.instanceMatrix),te==="instanceColor"&&C.instanceColor&&(ve=C.instanceColor)),pe===void 0||pe.attribute!==ve||ve&&pe.data!==ve.data)return!0;V++}return r.attributesNum!==V||r.index!==B}function _(C,L,O,B){const F={},k=L.attributes;let V=0;const Q=O.getAttributes();for(const te in Q)if(Q[te].location>=0){let pe=k[te];pe===void 0&&(te==="instanceMatrix"&&C.instanceMatrix&&(pe=C.instanceMatrix),te==="instanceColor"&&C.instanceColor&&(pe=C.instanceColor));const ve={};ve.attribute=pe,pe&&pe.data&&(ve.data=pe.data),F[te]=ve,V++}r.attributes=F,r.attributesNum=V,r.index=B}function v(){const C=r.newAttributes;for(let L=0,O=C.length;L<O;L++)C[L]=0}function m(C){f(C,0)}function f(C,L){const O=r.newAttributes,B=r.enabledAttributes,F=r.attributeDivisors;O[C]=1,B[C]===0&&(n.enableVertexAttribArray(C),B[C]=1),F[C]!==L&&(n.vertexAttribDivisor(C,L),F[C]=L)}function T(){const C=r.newAttributes,L=r.enabledAttributes;for(let O=0,B=L.length;O<B;O++)L[O]!==C[O]&&(n.disableVertexAttribArray(O),L[O]=0)}function R(C,L,O,B,F,k,V){V===!0?n.vertexAttribIPointer(C,L,O,F,k):n.vertexAttribPointer(C,L,O,B,F,k)}function S(C,L,O,B){v();const F=B.attributes,k=O.getAttributes(),V=L.defaultAttributeValues;for(const Q in k){const te=k[Q];if(te.location>=0){let se=F[Q];if(se===void 0&&(Q==="instanceMatrix"&&C.instanceMatrix&&(se=C.instanceMatrix),Q==="instanceColor"&&C.instanceColor&&(se=C.instanceColor)),se!==void 0){const pe=se.normalized,ve=se.itemSize,je=e.get(se);if(je===void 0)continue;const vt=je.buffer,et=je.type,K=je.bytesPerElement,ae=et===n.INT||et===n.UNSIGNED_INT||se.gpuType===Go;if(se.isInterleavedBufferAttribute){const ie=se.data,Ne=ie.stride,Oe=se.offset;if(ie.isInstancedInterleavedBuffer){for(let Pe=0;Pe<te.locationSize;Pe++)f(te.location+Pe,ie.meshPerAttribute);C.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let Pe=0;Pe<te.locationSize;Pe++)m(te.location+Pe);n.bindBuffer(n.ARRAY_BUFFER,vt);for(let Pe=0;Pe<te.locationSize;Pe++)R(te.location+Pe,ve/te.locationSize,et,pe,Ne*K,(Oe+ve/te.locationSize*Pe)*K,ae)}else{if(se.isInstancedBufferAttribute){for(let ie=0;ie<te.locationSize;ie++)f(te.location+ie,se.meshPerAttribute);C.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let ie=0;ie<te.locationSize;ie++)m(te.location+ie);n.bindBuffer(n.ARRAY_BUFFER,vt);for(let ie=0;ie<te.locationSize;ie++)R(te.location+ie,ve/te.locationSize,et,pe,ve*K,ve/te.locationSize*ie*K,ae)}}else if(V!==void 0){const pe=V[Q];if(pe!==void 0)switch(pe.length){case 2:n.vertexAttrib2fv(te.location,pe);break;case 3:n.vertexAttrib3fv(te.location,pe);break;case 4:n.vertexAttrib4fv(te.location,pe);break;default:n.vertexAttrib1fv(te.location,pe)}}}}T()}function E(){y();for(const C in i){const L=i[C];for(const O in L){const B=L[O];for(const F in B){const k=B[F];for(const V in k)u(k[V].object),delete k[V];delete B[F]}}delete i[C]}}function b(C){if(i[C.id]===void 0)return;const L=i[C.id];for(const O in L){const B=L[O];for(const F in B){const k=B[F];for(const V in k)u(k[V].object),delete k[V];delete B[F]}}delete i[C.id]}function P(C){for(const L in i){const O=i[L];for(const B in O){const F=O[B];if(F[C.id]===void 0)continue;const k=F[C.id];for(const V in k)u(k[V].object),delete k[V];delete F[C.id]}}}function x(C){for(const L in i){const O=i[L],B=C.isInstancedMesh===!0?C.id:0,F=O[B];if(F!==void 0){for(const k in F){const V=F[k];for(const Q in V)u(V[Q].object),delete V[Q];delete F[k]}delete O[B],Object.keys(O).length===0&&delete i[L]}}}function y(){A(),a=!0,r!==s&&(r=s,c(r.object))}function A(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:y,resetDefaultState:A,dispose:E,releaseStatesOfGeometry:b,releaseStatesOfObject:x,releaseStatesOfProgram:P,initAttributes:v,enableAttribute:m,disableUnusedAttributes:T}}function Yp(n,e,t){let i;function s(l){i=l}function r(l,c){n.drawArrays(i,l,c),t.update(c,i,1)}function a(l,c,u){u!==0&&(n.drawArraysInstanced(i,l,c,u),t.update(c,i,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,u);let h=0;for(let p=0;p<u;p++)h+=c[p];t.update(h,i,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function $p(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const P=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(P){return!(P!==Ci&&i.convert(P)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(P){const x=P===mi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(P!==pi&&i.convert(P)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&P!==Gi&&!x)}function l(P){if(P==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";P="mediump"}return P==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(Ie("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const d=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&h===!1&&Ie("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const p=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),f=n.getParameter(n.MAX_VERTEX_ATTRIBS),T=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),R=n.getParameter(n.MAX_VARYING_VECTORS),S=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),E=n.getParameter(n.MAX_SAMPLES),b=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:h,maxTextures:p,maxVertexTextures:_,maxTextureSize:v,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:T,maxVaryings:R,maxFragmentUniforms:S,maxSamples:E,samples:b}}function Zp(n){const e=this;let t=null,i=0,s=!1,r=!1;const a=new An,o=new Fe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){const p=d.length!==0||h||i!==0||s;return s=h,i=d.length,p},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,h){t=u(d,h,0)},this.setState=function(d,h,p){const _=d.clippingPlanes,v=d.clipIntersection,m=d.clipShadows,f=n.get(d);if(!s||_===null||_.length===0||r&&!m)r?u(null):c();else{const T=r?0:i,R=T*4;let S=f.clippingState||null;l.value=S,S=u(_,h,R,p);for(let E=0;E!==R;++E)S[E]=t[E];f.clippingState=S,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=T}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(d,h,p,_){const v=d!==null?d.length:0;let m=null;if(v!==0){if(m=l.value,_!==!0||m===null){const f=p+v*4,T=h.matrixWorldInverse;o.getNormalMatrix(T),(m===null||m.length<f)&&(m=new Float32Array(f));for(let R=0,S=p;R!==v;++R,S+=4)a.copy(d[R]).applyMatrix4(T,o),a.normal.toArray(m,S),m[S+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}const gn=4,ic=[.125,.215,.35,.446,.526,.582],Cn=20,Kp=256,Es=new Hs,nc=new Ce;let ba=null,Ea=0,Ta=0,wa=!1;const Jp=new I;class sc{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){const{size:a=256,position:o=Jp}=r;ba=this._renderer.getRenderTarget(),Ea=this._renderer.getActiveCubeFace(),Ta=this._renderer.getActiveMipmapLevel(),wa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=oc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ac(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(ba,Ea,Ta),this._renderer.xr.enabled=wa,e.scissorTest=!1,Qn(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Dn||e.mapping===as?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ba=this._renderer.getRenderTarget(),Ea=this._renderer.getActiveCubeFace(),Ta=this._renderer.getActiveMipmapLevel(),wa=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Zt,minFilter:Zt,generateMipmaps:!1,type:mi,format:Ci,colorSpace:Cr,depthBuffer:!1},s=rc(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=rc(e,t,i);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Qp(r)),this._blurMaterial=em(r,e,t),this._ggxMaterial=jp(r,e,t)}return s}_compileMaterial(e){const t=new ke(new st,e);this._renderer.compile(t,Es)}_sceneToCubeUV(e,t,i,s,r){const l=new Mi(90,1,t,i),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,h=d.autoClear,p=d.toneMapping;d.getClearColor(nc),d.toneMapping=Li,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ke(new Pi,new mt({name:"PMREM.Background",side:ai,depthWrite:!1,depthTest:!1})));const v=this._backgroundBox,m=v.material;let f=!1;const T=e.background;T?T.isColor&&(m.color.copy(T),e.background=null,f=!0):(m.color.copy(nc),f=!0);for(let R=0;R<6;R++){const S=R%3;S===0?(l.up.set(0,c[R],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[R],r.y,r.z)):S===1?(l.up.set(0,0,c[R]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[R],r.z)):(l.up.set(0,c[R],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[R]));const E=this._cubeSize;Qn(s,S*E,R>2?E:0,E,E),d.setRenderTarget(s),f&&d.render(v,l),d.render(e,l)}d.toneMapping=p,d.autoClear=h,e.background=T}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===Dn||e.mapping===as;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=oc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ac());const r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;const o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;Qn(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(a,Es)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){const s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;const l=a.uniforms,c=i/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),d=Math.sqrt(c*c-u*u),h=0+c*1.25,p=d*h,{_lodMax:_}=this,v=this._sizeLods[i],m=3*v*(i>_-gn?i-_+gn:0),f=4*(this._cubeSize-v);l.envMap.value=e.texture,l.roughness.value=p,l.mipInt.value=_-t,Qn(r,m,f,3*v,2*v),s.setRenderTarget(r),s.render(o,Es),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=_-i,Qn(e,m,f,3*v,2*v),s.setRenderTarget(e),s.render(o,Es)}_blur(e,t,i,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,s,"latitudinal",r),this._halfBlur(a,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&Qe("blur direction must be either latitudinal or longitudinal!");const u=3,d=this._lodMeshes[s];d.material=c;const h=c.uniforms,p=this._sizeLods[i]-1,_=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*Cn-1),v=r/_,m=isFinite(r)?1+Math.floor(u*v):Cn;m>Cn&&Ie(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Cn}`);const f=[];let T=0;for(let P=0;P<Cn;++P){const x=P/v,y=Math.exp(-x*x/2);f.push(y),P===0?T+=y:P<m&&(T+=2*y)}for(let P=0;P<f.length;P++)f[P]=f[P]/T;h.envMap.value=e.texture,h.samples.value=m,h.weights.value=f,h.latitudinal.value=a==="latitudinal",o&&(h.poleAxis.value=o);const{_lodMax:R}=this;h.dTheta.value=_,h.mipInt.value=R-i;const S=this._sizeLods[s],E=3*S*(s>R-gn?s-R+gn:0),b=4*(this._cubeSize-S);Qn(t,E,b,3*S,2*S),l.setRenderTarget(t),l.render(d,Es)}}function Qp(n){const e=[],t=[],i=[];let s=n;const r=n-gn+1+ic.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let l=1/o;a>n-gn?l=ic[a-n+gn-1]:a===0&&(l=0),t.push(l);const c=1/(o-2),u=-c,d=1+c,h=[u,u,d,u,d,d,u,u,d,d,u,d],p=6,_=6,v=3,m=2,f=1,T=new Float32Array(v*_*p),R=new Float32Array(m*_*p),S=new Float32Array(f*_*p);for(let b=0;b<p;b++){const P=b%3*2/3-1,x=b>2?0:-1,y=[P,x,0,P+2/3,x,0,P+2/3,x+1,0,P,x,0,P+2/3,x+1,0,P,x+1,0];T.set(y,v*_*b),R.set(h,m*_*b);const A=[b,b,b,b,b,b];S.set(A,f*_*b)}const E=new st;E.setAttribute("position",new pt(T,v)),E.setAttribute("uv",new pt(R,m)),E.setAttribute("faceIndex",new pt(S,f)),i.push(new ke(E,null)),s>gn&&s--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function rc(n,e,t){const i=new oi(n,e,t);return i.texture.mapping=Or,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Qn(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function jp(n,e,t){return new Kt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Kp,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:zr(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Vi,depthTest:!1,depthWrite:!1})}function em(n,e,t){const i=new Float32Array(Cn),s=new I(0,1,0);return new Kt({name:"SphericalGaussianBlur",defines:{n:Cn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:zr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Vi,depthTest:!1,depthWrite:!1})}function ac(){return new Kt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:zr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Vi,depthTest:!1,depthWrite:!1})}function oc(){return new Kt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:zr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Vi,depthTest:!1,depthWrite:!1})}function zr(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class dh extends oi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new sh(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Pi(5,5,5),r=new Kt({name:"CubemapFromEquirect",uniforms:cs(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:ai,blending:Vi});r.uniforms.tEquirect.value=t;const a=new ke(s,r),o=t.minFilter;return t.minFilter===Pn&&(t.minFilter=Zt),new nd(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,s);e.setRenderTarget(r)}}function tm(n){let e=new WeakMap,t=new WeakMap,i=null;function s(h,p=!1){return h==null?null:p?a(h):r(h)}function r(h){if(h&&h.isTexture){const p=h.mapping;if(p===$r||p===Zr)if(e.has(h)){const _=e.get(h).texture;return o(_,h.mapping)}else{const _=h.image;if(_&&_.height>0){const v=new dh(_.height);return v.fromEquirectangularTexture(n,h),e.set(h,v),h.addEventListener("dispose",c),o(v.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){const p=h.mapping,_=p===$r||p===Zr,v=p===Dn||p===as;if(_||v){let m=t.get(h);const f=m!==void 0?m.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==f)return i===null&&(i=new sc(n)),m=_?i.fromEquirectangular(h,m):i.fromCubemap(h,m),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),m.texture;if(m!==void 0)return m.texture;{const T=h.image;return _&&T&&T.height>0||v&&T&&l(T)?(i===null&&(i=new sc(n)),m=_?i.fromEquirectangular(h):i.fromCubemap(h),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),h.addEventListener("dispose",u),m.texture):null}}}return h}function o(h,p){return p===$r?h.mapping=Dn:p===Zr&&(h.mapping=as),h}function l(h){let p=0;const _=6;for(let v=0;v<_;v++)h[v]!==void 0&&p++;return p===_}function c(h){const p=h.target;p.removeEventListener("dispose",c);const _=e.get(p);_!==void 0&&(e.delete(p),_.dispose())}function u(h){const p=h.target;p.removeEventListener("dispose",u);const _=t.get(p);_!==void 0&&(t.delete(p),_.dispose())}function d(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:d}}function im(n){const e={};function t(i){if(e[i]!==void 0)return e[i];const s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const s=t(i);return s===null&&ts("WebGLRenderer: "+i+" extension not supported."),s}}}function nm(n,e,t,i){const s={},r=new WeakMap;function a(d){const h=d.target;h.index!==null&&e.remove(h.index);for(const _ in h.attributes)e.remove(h.attributes[_]);h.removeEventListener("dispose",a),delete s[h.id];const p=r.get(h);p&&(e.remove(p),r.delete(h)),i.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function o(d,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,t.memory.geometries++),h}function l(d){const h=d.attributes;for(const p in h)e.update(h[p],n.ARRAY_BUFFER)}function c(d){const h=[],p=d.index,_=d.attributes.position;let v=0;if(_===void 0)return;if(p!==null){const T=p.array;v=p.version;for(let R=0,S=T.length;R<S;R+=3){const E=T[R+0],b=T[R+1],P=T[R+2];h.push(E,b,b,P,P,E)}}else{const T=_.array;v=_.version;for(let R=0,S=T.length/3-1;R<S;R+=3){const E=R+0,b=R+1,P=R+2;h.push(E,b,b,P,P,E)}}const m=new(_.count>=65535?ih:th)(h,1);m.version=v;const f=r.get(d);f&&e.remove(f),r.set(d,m)}function u(d){const h=r.get(d);if(h){const p=d.index;p!==null&&h.version<p.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:u}}function sm(n,e,t){let i;function s(d){i=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,h){n.drawElements(i,h,r,d*a),t.update(h,i,1)}function c(d,h,p){p!==0&&(n.drawElementsInstanced(i,h,r,d*a,p),t.update(h,i,p))}function u(d,h,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,h,0,r,d,0,p);let v=0;for(let m=0;m<p;m++)v+=h[m];t.update(v,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function rm(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(r/3);break;case n.LINES:t.lines+=o*(r/2);break;case n.LINE_STRIP:t.lines+=o*(r-1);break;case n.LINE_LOOP:t.lines+=o*r;break;case n.POINTS:t.points+=o*r;break;default:Qe("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function am(n,e,t){const i=new WeakMap,s=new xt;function r(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=u!==void 0?u.length:0;let h=i.get(o);if(h===void 0||h.count!==d){let y=function(){P.dispose(),i.delete(o),o.removeEventListener("dispose",y)};h!==void 0&&h.texture.dispose();const p=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],f=o.morphAttributes.normal||[],T=o.morphAttributes.color||[];let R=0;p===!0&&(R=1),_===!0&&(R=2),v===!0&&(R=3);let S=o.attributes.position.count*R,E=1;S>e.maxTextureSize&&(E=Math.ceil(S/e.maxTextureSize),S=e.maxTextureSize);const b=new Float32Array(S*E*4*d),P=new Qc(b,S,E,d);P.type=Gi,P.needsUpdate=!0;const x=R*4;for(let A=0;A<d;A++){const C=m[A],L=f[A],O=T[A],B=S*E*4*A;for(let F=0;F<C.count;F++){const k=F*x;p===!0&&(s.fromBufferAttribute(C,F),b[B+k+0]=s.x,b[B+k+1]=s.y,b[B+k+2]=s.z,b[B+k+3]=0),_===!0&&(s.fromBufferAttribute(L,F),b[B+k+4]=s.x,b[B+k+5]=s.y,b[B+k+6]=s.z,b[B+k+7]=0),v===!0&&(s.fromBufferAttribute(O,F),b[B+k+8]=s.x,b[B+k+9]=s.y,b[B+k+10]=s.z,b[B+k+11]=O.itemSize===4?s.w:1)}}h={count:d,texture:P,size:new Ue(S,E)},i.set(o,h),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let p=0;for(let v=0;v<c.length;v++)p+=c[v];const _=o.morphTargetsRelative?1:1-p;l.getUniforms().setValue(n,"morphTargetBaseInfluence",_),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",h.size)}return{update:r}}function om(n,e,t,i,s){let r=new WeakMap;function a(c){const u=s.render.frame,d=c.geometry,h=e.get(c,d);if(r.get(h)!==u&&(e.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){const p=c.skeleton;r.get(p)!==u&&(p.update(),r.set(p,u))}return h}function o(){r=new WeakMap}function l(c){const u=c.target;u.removeEventListener("dispose",l),i.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}const lm={[Uo]:"LINEAR_TONE_MAPPING",[No]:"REINHARD_TONE_MAPPING",[Fo]:"CINEON_TONE_MAPPING",[Oo]:"ACES_FILMIC_TONE_MAPPING",[Bo]:"AGX_TONE_MAPPING",[ko]:"NEUTRAL_TONE_MAPPING",[zo]:"CUSTOM_TONE_MAPPING"};function cm(n,e,t,i,s,r){const a=new oi(e,t,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,depthTexture:s?new os(e,t):void 0}),o=new oi(e,t,{type:mi,depthBuffer:!1,stencilBuffer:!1}),l=new st;l.setAttribute("position",new at([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new at([0,2,0,0,2,0],2));const c=new oh({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new ke(l,c),d=new Hs(-1,1,1,-1,0,1);let h=null,p=null,_=!1,v,m=null,f=[],T=!1;this.setSize=function(R,S){a.setSize(R,S),o.setSize(R,S);for(let E=0;E<f.length;E++){const b=f[E];b.setSize&&b.setSize(R,S)}},this.setEffects=function(R){f=R,T=f.length>0&&f[0].isRenderPass===!0;const S=a.width,E=a.height;for(let b=0;b<f.length;b++){const P=f[b];P.setSize&&P.setSize(S,E)}},this.begin=function(R,S){if(_||R.toneMapping===Li&&f.length===0)return!1;if(m=S,S!==null){const E=S.width,b=S.height;(a.width!==E||a.height!==b)&&this.setSize(E,b)}return T===!1&&R.setRenderTarget(a),v=R.toneMapping,R.toneMapping=Li,!0},this.hasRenderPass=function(){return T},this.end=function(R,S){R.toneMapping=v,_=!0;let E=a,b=o;for(let P=0;P<f.length;P++){const x=f[P];if(x.enabled!==!1&&(x.render(R,b,E,S),x.needsSwap!==!1)){const y=E;E=b,b=y}}if(h!==R.outputColorSpace||p!==R.toneMapping){h=R.outputColorSpace,p=R.toneMapping,c.defines={},qe.getTransfer(h)===nt&&(c.defines.SRGB_TRANSFER="");const P=lm[p];P&&(c.defines[P]=""),c.needsUpdate=!0}c.uniforms.tDiffuse.value=E.texture,R.setRenderTarget(m),R.render(u,d),m=null,_=!1},this.isCompositing=function(){return _},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),l.dispose(),c.dispose()}}const fh=new ei,wo=new os(1,1),ph=new Qc,mh=new Ru,gh=new sh,lc=[],cc=[],hc=new Float32Array(16),uc=new Float32Array(9),dc=new Float32Array(4);function ps(n,e,t){const i=n[0];if(i<=0||i>0)return n;const s=e*t;let r=lc[s];if(r===void 0&&(r=new Float32Array(s),lc[s]=r),e!==0){i.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(r,o)}return r}function Ut(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Nt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Br(n,e){let t=cc[e];t===void 0&&(t=new Int32Array(e),cc[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function hm(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function um(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;n.uniform2fv(this.addr,e),Nt(t,e)}}function dm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ut(t,e))return;n.uniform3fv(this.addr,e),Nt(t,e)}}function fm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;n.uniform4fv(this.addr,e),Nt(t,e)}}function pm(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Ut(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Nt(t,e)}else{if(Ut(t,i))return;dc.set(i),n.uniformMatrix2fv(this.addr,!1,dc),Nt(t,i)}}function mm(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Ut(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Nt(t,e)}else{if(Ut(t,i))return;uc.set(i),n.uniformMatrix3fv(this.addr,!1,uc),Nt(t,i)}}function gm(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Ut(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Nt(t,e)}else{if(Ut(t,i))return;hc.set(i),n.uniformMatrix4fv(this.addr,!1,hc),Nt(t,i)}}function _m(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function xm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;n.uniform2iv(this.addr,e),Nt(t,e)}}function vm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ut(t,e))return;n.uniform3iv(this.addr,e),Nt(t,e)}}function Mm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;n.uniform4iv(this.addr,e),Nt(t,e)}}function Sm(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function ym(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;n.uniform2uiv(this.addr,e),Nt(t,e)}}function bm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ut(t,e))return;n.uniform3uiv(this.addr,e),Nt(t,e)}}function Em(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;n.uniform4uiv(this.addr,e),Nt(t,e)}}function Tm(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(wo.compareFunction=t.isReversedDepthBuffer()?$o:Yo,r=wo):r=fh,t.setTexture2D(e||r,s)}function wm(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||mh,s)}function Am(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||gh,s)}function Rm(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||ph,s)}function Cm(n){switch(n){case 5126:return hm;case 35664:return um;case 35665:return dm;case 35666:return fm;case 35674:return pm;case 35675:return mm;case 35676:return gm;case 5124:case 35670:return _m;case 35667:case 35671:return xm;case 35668:case 35672:return vm;case 35669:case 35673:return Mm;case 5125:return Sm;case 36294:return ym;case 36295:return bm;case 36296:return Em;case 35678:case 36198:case 36298:case 36306:case 35682:return Tm;case 35679:case 36299:case 36307:return wm;case 35680:case 36300:case 36308:case 36293:return Am;case 36289:case 36303:case 36311:case 36292:return Rm}}function Pm(n,e){n.uniform1fv(this.addr,e)}function Lm(n,e){const t=ps(e,this.size,2);n.uniform2fv(this.addr,t)}function Dm(n,e){const t=ps(e,this.size,3);n.uniform3fv(this.addr,t)}function Im(n,e){const t=ps(e,this.size,4);n.uniform4fv(this.addr,t)}function Um(n,e){const t=ps(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function Nm(n,e){const t=ps(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function Fm(n,e){const t=ps(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function Om(n,e){n.uniform1iv(this.addr,e)}function zm(n,e){n.uniform2iv(this.addr,e)}function Bm(n,e){n.uniform3iv(this.addr,e)}function km(n,e){n.uniform4iv(this.addr,e)}function Gm(n,e){n.uniform1uiv(this.addr,e)}function Hm(n,e){n.uniform2uiv(this.addr,e)}function Vm(n,e){n.uniform3uiv(this.addr,e)}function Wm(n,e){n.uniform4uiv(this.addr,e)}function Xm(n,e,t){const i=this.cache,s=e.length,r=Br(t,s);Ut(i,r)||(n.uniform1iv(this.addr,r),Nt(i,r));let a;this.type===n.SAMPLER_2D_SHADOW?a=wo:a=fh;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function qm(n,e,t){const i=this.cache,s=e.length,r=Br(t,s);Ut(i,r)||(n.uniform1iv(this.addr,r),Nt(i,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||mh,r[a])}function Ym(n,e,t){const i=this.cache,s=e.length,r=Br(t,s);Ut(i,r)||(n.uniform1iv(this.addr,r),Nt(i,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||gh,r[a])}function $m(n,e,t){const i=this.cache,s=e.length,r=Br(t,s);Ut(i,r)||(n.uniform1iv(this.addr,r),Nt(i,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||ph,r[a])}function Zm(n){switch(n){case 5126:return Pm;case 35664:return Lm;case 35665:return Dm;case 35666:return Im;case 35674:return Um;case 35675:return Nm;case 35676:return Fm;case 5124:case 35670:return Om;case 35667:case 35671:return zm;case 35668:case 35672:return Bm;case 35669:case 35673:return km;case 5125:return Gm;case 36294:return Hm;case 36295:return Vm;case 36296:return Wm;case 35678:case 36198:case 36298:case 36306:case 35682:return Xm;case 35679:case 36299:case 36307:return qm;case 35680:case 36300:case 36308:case 36293:return Ym;case 36289:case 36303:case 36311:case 36292:return $m}}class Km{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Cm(t.type)}}class Jm{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Zm(t.type)}}class Qm{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],i)}}}const Aa=/(\w+)(\])?(\[|\.)?/g;function fc(n,e){n.seq.push(e),n.map[e.id]=e}function jm(n,e,t){const i=n.name,s=i.length;for(Aa.lastIndex=0;;){const r=Aa.exec(i),a=Aa.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){fc(t,c===void 0?new Km(o,n,e):new Jm(o,n,e));break}else{let d=t.map[o];d===void 0&&(d=new Qm(o),fc(t,d)),t=d}}}class Tr{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);jm(o,l,this)}const s=[],r=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){const r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&i.push(a)}return i}}function pc(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const eg=37297;let tg=0;function ig(n,e){const t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}const mc=new Fe;function ng(n){qe._getMatrix(mc,qe.workingColorSpace,n);const e=`mat3( ${mc.elements.map(t=>t.toFixed(4))} )`;switch(qe.getTransfer(n)){case Pr:return[e,"LinearTransferOETF"];case nt:return[e,"sRGBTransferOETF"];default:return Ie("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function gc(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+ig(n.getShaderSource(e),o)}else return r}function sg(n,e){const t=ng(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const rg={[Uo]:"Linear",[No]:"Reinhard",[Fo]:"Cineon",[Oo]:"ACESFilmic",[Bo]:"AgX",[ko]:"Neutral",[zo]:"Custom"};function ag(n,e){const t=rg[e];return t===void 0?(Ie("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const gr=new I;function og(){qe.getLuminanceCoefficients(gr);const n=gr.x.toFixed(4),e=gr.y.toFixed(4),t=gr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function lg(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ls).join(`
`)}function cg(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function hg(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(e,s),a=r.name;let o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function Ls(n){return n!==""}function _c(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function xc(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const ug=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ao(n){return n.replace(ug,fg)}const dg=new Map;function fg(n,e){let t=Ge[e];if(t===void 0){const i=dg.get(e);if(i!==void 0)t=Ge[i],Ie('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Ao(t)}const pg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function vc(n){return n.replace(pg,mg)}function mg(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Mc(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const gg={[Mr]:"SHADOWMAP_TYPE_PCF",[Ps]:"SHADOWMAP_TYPE_VSM"};function _g(n){return gg[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const xg={[Dn]:"ENVMAP_TYPE_CUBE",[as]:"ENVMAP_TYPE_CUBE",[Or]:"ENVMAP_TYPE_CUBE_UV"};function vg(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":xg[n.envMapMode]||"ENVMAP_TYPE_CUBE"}const Mg={[as]:"ENVMAP_MODE_REFRACTION"};function Sg(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":Mg[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}const yg={[Hc]:"ENVMAP_BLENDING_MULTIPLY",[ou]:"ENVMAP_BLENDING_MIX",[lu]:"ENVMAP_BLENDING_ADD"};function bg(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":yg[n.combine]||"ENVMAP_BLENDING_NONE"}function Eg(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function Tg(n,e,t,i){const s=n.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=_g(t),c=vg(t),u=Sg(t),d=bg(t),h=Eg(t),p=lg(t),_=cg(r),v=s.createProgram();let m,f,T=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Ls).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Ls).join(`
`),f.length>0&&(f+=`
`)):(m=[Mc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ls).join(`
`),f=[Mc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Li?"#define TONE_MAPPING":"",t.toneMapping!==Li?Ge.tonemapping_pars_fragment:"",t.toneMapping!==Li?ag("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ge.colorspace_pars_fragment,sg("linearToOutputTexel",t.outputColorSpace),og(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ls).join(`
`)),a=Ao(a),a=_c(a,t),a=xc(a,t),o=Ao(o),o=_c(o,t),o=xc(o,t),a=vc(a),o=vc(o),t.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",t.glslVersion===Tl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Tl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);const R=T+m+a,S=T+f+o,E=pc(s,s.VERTEX_SHADER,R),b=pc(s,s.FRAGMENT_SHADER,S);s.attachShader(v,E),s.attachShader(v,b),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function P(C){if(n.debug.checkShaderErrors){const L=s.getProgramInfoLog(v)||"",O=s.getShaderInfoLog(E)||"",B=s.getShaderInfoLog(b)||"",F=L.trim(),k=O.trim(),V=B.trim();let Q=!0,te=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(Q=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,v,E,b);else{const se=gc(s,E,"vertex"),pe=gc(s,b,"fragment");Qe("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+F+`
`+se+`
`+pe)}else F!==""?Ie("WebGLProgram: Program Info Log:",F):(k===""||V==="")&&(te=!1);te&&(C.diagnostics={runnable:Q,programLog:F,vertexShader:{log:k,prefix:m},fragmentShader:{log:V,prefix:f}})}s.deleteShader(E),s.deleteShader(b),x=new Tr(s,v),y=hg(s,v)}let x;this.getUniforms=function(){return x===void 0&&P(this),x};let y;this.getAttributes=function(){return y===void 0&&P(this),y};let A=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return A===!1&&(A=s.getProgramParameter(v,eg)),A},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=tg++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=E,this.fragmentShader=b,this}let wg=0;class Ag{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){const s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new Rg(e),t.set(e,i)),i}}class Rg{constructor(e){this.id=wg++,this.code=e,this.usedTimes=0}}function Cg(n){return n===In||n===Ar||n===Rr}function Pg(n,e,t,i,s,r){const a=new jc,o=new Ag,l=new Set,c=[],u=new Map,d=i.logarithmicDepthBuffer;let h=i.precision;const p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(x){return l.add(x),x===0?"uv":`uv${x}`}function v(x,y,A,C,L,O){const B=C.fog,F=L.geometry,k=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?C.environment:null,V=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,Q=e.get(x.envMap||k,V),te=Q&&Q.mapping===Or?Q.image.height:null,se=p[x.type];x.precision!==null&&(h=i.getMaxPrecision(x.precision),h!==x.precision&&Ie("WebGLProgram.getParameters:",x.precision,"not supported, using",h,"instead."));const pe=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,ve=pe!==void 0?pe.length:0;let je=0;F.morphAttributes.position!==void 0&&(je=1),F.morphAttributes.normal!==void 0&&(je=2),F.morphAttributes.color!==void 0&&(je=3);let vt,et,K,ae;if(se){const Se=zi[se];vt=Se.vertexShader,et=Se.fragmentShader}else{vt=x.vertexShader,et=x.fragmentShader;const Se=o.getVertexShaderStage(x),St=o.getFragmentShaderStage(x);o.update(x,Se,St),K=Se.id,ae=St.id}const ie=n.getRenderTarget(),Ne=n.state.buffers.depth.getReversed(),Oe=L.isInstancedMesh===!0,Pe=L.isBatchedMesh===!0,Tt=!!x.map,Xe=!!x.matcap,lt=!!Q,tt=!!x.aoMap,Ke=!!x.lightMap,Ct=!!x.bumpMap&&x.wireframe===!1,Dt=!!x.normalMap,Ft=!!x.displacementMap,Ht=!!x.emissiveMap,Mt=!!x.metalnessMap,Pt=!!x.roughnessMap,U=x.anisotropy>0,ti=x.clearcoat>0,rt=x.dispersion>0,w=x.iridescence>0,g=x.sheen>0,z=x.transmission>0,W=U&&!!x.anisotropyMap,q=ti&&!!x.clearcoatMap,ne=ti&&!!x.clearcoatNormalMap,oe=ti&&!!x.clearcoatRoughnessMap,Y=w&&!!x.iridescenceMap,Z=w&&!!x.iridescenceThicknessMap,le=g&&!!x.sheenColorMap,Te=g&&!!x.sheenRoughnessMap,de=!!x.specularMap,ce=!!x.specularColorMap,Re=!!x.specularIntensityMap,Le=z&&!!x.transmissionMap,ze=z&&!!x.thicknessMap,D=!!x.gradientMap,re=!!x.alphaMap,$=x.alphaTest>0,he=!!x.alphaHash,_e=!!x.extensions;let j=Li;x.toneMapped&&(ie===null||ie.isXRRenderTarget===!0)&&(j=n.toneMapping);const Ee={shaderID:se,shaderType:x.type,shaderName:x.name,vertexShader:vt,fragmentShader:et,defines:x.defines,customVertexShaderID:K,customFragmentShaderID:ae,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:h,batching:Pe,batchingColor:Pe&&L._colorsTexture!==null,instancing:Oe,instancingColor:Oe&&L.instanceColor!==null,instancingMorph:Oe&&L.morphTexture!==null,outputColorSpace:ie===null?n.outputColorSpace:ie.isXRRenderTarget===!0?ie.texture.colorSpace:qe.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:Tt,matcap:Xe,envMap:lt,envMapMode:lt&&Q.mapping,envMapCubeUVHeight:te,aoMap:tt,lightMap:Ke,bumpMap:Ct,normalMap:Dt,displacementMap:Ft,emissiveMap:Ht,normalMapObjectSpace:Dt&&x.normalMapType===uu,normalMapTangentSpace:Dt&&x.normalMapType===yo,packedNormalMap:Dt&&x.normalMapType===yo&&Cg(x.normalMap.format),metalnessMap:Mt,roughnessMap:Pt,anisotropy:U,anisotropyMap:W,clearcoat:ti,clearcoatMap:q,clearcoatNormalMap:ne,clearcoatRoughnessMap:oe,dispersion:rt,iridescence:w,iridescenceMap:Y,iridescenceThicknessMap:Z,sheen:g,sheenColorMap:le,sheenRoughnessMap:Te,specularMap:de,specularColorMap:ce,specularIntensityMap:Re,transmission:z,transmissionMap:Le,thicknessMap:ze,gradientMap:D,opaque:x.transparent===!1&&x.blending===es&&x.alphaToCoverage===!1,alphaMap:re,alphaTest:$,alphaHash:he,combine:x.combine,mapUv:Tt&&_(x.map.channel),aoMapUv:tt&&_(x.aoMap.channel),lightMapUv:Ke&&_(x.lightMap.channel),bumpMapUv:Ct&&_(x.bumpMap.channel),normalMapUv:Dt&&_(x.normalMap.channel),displacementMapUv:Ft&&_(x.displacementMap.channel),emissiveMapUv:Ht&&_(x.emissiveMap.channel),metalnessMapUv:Mt&&_(x.metalnessMap.channel),roughnessMapUv:Pt&&_(x.roughnessMap.channel),anisotropyMapUv:W&&_(x.anisotropyMap.channel),clearcoatMapUv:q&&_(x.clearcoatMap.channel),clearcoatNormalMapUv:ne&&_(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:oe&&_(x.clearcoatRoughnessMap.channel),iridescenceMapUv:Y&&_(x.iridescenceMap.channel),iridescenceThicknessMapUv:Z&&_(x.iridescenceThicknessMap.channel),sheenColorMapUv:le&&_(x.sheenColorMap.channel),sheenRoughnessMapUv:Te&&_(x.sheenRoughnessMap.channel),specularMapUv:de&&_(x.specularMap.channel),specularColorMapUv:ce&&_(x.specularColorMap.channel),specularIntensityMapUv:Re&&_(x.specularIntensityMap.channel),transmissionMapUv:Le&&_(x.transmissionMap.channel),thicknessMapUv:ze&&_(x.thicknessMap.channel),alphaMapUv:re&&_(x.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(Dt||U),vertexNormals:!!F.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!F.attributes.uv&&(Tt||re),fog:!!B,useFog:x.fog===!0,fogExp2:!!B&&B.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||F.attributes.normal===void 0&&Dt===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:Ne,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:F.attributes.position!==void 0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:ve,morphTextureStride:je,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numLightProbeGrids:O.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:n.shadowMap.enabled&&A.length>0,shadowMapType:n.shadowMap.type,toneMapping:j,decodeVideoTexture:Tt&&x.map.isVideoTexture===!0&&qe.getTransfer(x.map.colorSpace)===nt,decodeVideoTextureEmissive:Ht&&x.emissiveMap.isVideoTexture===!0&&qe.getTransfer(x.emissiveMap.colorSpace)===nt,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Bt,flipSided:x.side===ai,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:_e&&x.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(_e&&x.extensions.multiDraw===!0||Pe)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Ee.vertexUv1s=l.has(1),Ee.vertexUv2s=l.has(2),Ee.vertexUv3s=l.has(3),l.clear(),Ee}function m(x){const y=[];if(x.shaderID?y.push(x.shaderID):(y.push(x.customVertexShaderID),y.push(x.customFragmentShaderID)),x.defines!==void 0)for(const A in x.defines)y.push(A),y.push(x.defines[A]);return x.isRawShaderMaterial===!1&&(f(y,x),T(y,x),y.push(n.outputColorSpace)),y.push(x.customProgramCacheKey),y.join()}function f(x,y){x.push(y.precision),x.push(y.outputColorSpace),x.push(y.envMapMode),x.push(y.envMapCubeUVHeight),x.push(y.mapUv),x.push(y.alphaMapUv),x.push(y.lightMapUv),x.push(y.aoMapUv),x.push(y.bumpMapUv),x.push(y.normalMapUv),x.push(y.displacementMapUv),x.push(y.emissiveMapUv),x.push(y.metalnessMapUv),x.push(y.roughnessMapUv),x.push(y.anisotropyMapUv),x.push(y.clearcoatMapUv),x.push(y.clearcoatNormalMapUv),x.push(y.clearcoatRoughnessMapUv),x.push(y.iridescenceMapUv),x.push(y.iridescenceThicknessMapUv),x.push(y.sheenColorMapUv),x.push(y.sheenRoughnessMapUv),x.push(y.specularMapUv),x.push(y.specularColorMapUv),x.push(y.specularIntensityMapUv),x.push(y.transmissionMapUv),x.push(y.thicknessMapUv),x.push(y.combine),x.push(y.fogExp2),x.push(y.sizeAttenuation),x.push(y.morphTargetsCount),x.push(y.morphAttributeCount),x.push(y.numDirLights),x.push(y.numPointLights),x.push(y.numSpotLights),x.push(y.numSpotLightMaps),x.push(y.numHemiLights),x.push(y.numRectAreaLights),x.push(y.numDirLightShadows),x.push(y.numPointLightShadows),x.push(y.numSpotLightShadows),x.push(y.numSpotLightShadowsWithMaps),x.push(y.numLightProbes),x.push(y.shadowMapType),x.push(y.toneMapping),x.push(y.numClippingPlanes),x.push(y.numClipIntersection),x.push(y.depthPacking)}function T(x,y){a.disableAll(),y.instancing&&a.enable(0),y.instancingColor&&a.enable(1),y.instancingMorph&&a.enable(2),y.matcap&&a.enable(3),y.envMap&&a.enable(4),y.normalMapObjectSpace&&a.enable(5),y.normalMapTangentSpace&&a.enable(6),y.clearcoat&&a.enable(7),y.iridescence&&a.enable(8),y.alphaTest&&a.enable(9),y.vertexColors&&a.enable(10),y.vertexAlphas&&a.enable(11),y.vertexUv1s&&a.enable(12),y.vertexUv2s&&a.enable(13),y.vertexUv3s&&a.enable(14),y.vertexTangents&&a.enable(15),y.anisotropy&&a.enable(16),y.alphaHash&&a.enable(17),y.batching&&a.enable(18),y.dispersion&&a.enable(19),y.batchingColor&&a.enable(20),y.gradientMap&&a.enable(21),y.packedNormalMap&&a.enable(22),y.vertexNormals&&a.enable(23),x.push(a.mask),a.disableAll(),y.fog&&a.enable(0),y.useFog&&a.enable(1),y.flatShading&&a.enable(2),y.logarithmicDepthBuffer&&a.enable(3),y.reversedDepthBuffer&&a.enable(4),y.skinning&&a.enable(5),y.morphTargets&&a.enable(6),y.morphNormals&&a.enable(7),y.morphColors&&a.enable(8),y.premultipliedAlpha&&a.enable(9),y.shadowMapEnabled&&a.enable(10),y.doubleSided&&a.enable(11),y.flipSided&&a.enable(12),y.useDepthPacking&&a.enable(13),y.dithering&&a.enable(14),y.transmission&&a.enable(15),y.sheen&&a.enable(16),y.opaque&&a.enable(17),y.pointsUvs&&a.enable(18),y.decodeVideoTexture&&a.enable(19),y.decodeVideoTextureEmissive&&a.enable(20),y.alphaToCoverage&&a.enable(21),y.numLightProbeGrids>0&&a.enable(22),y.hasPositionAttribute&&a.enable(23),x.push(a.mask)}function R(x){const y=p[x.type];let A;if(y){const C=zi[y];A=Os.clone(C.uniforms)}else A=x.uniforms;return A}function S(x,y){let A=u.get(y);return A!==void 0?++A.usedTimes:(A=new Tg(n,y,x,s),c.push(A),u.set(y,A)),A}function E(x){if(--x.usedTimes===0){const y=c.indexOf(x);c[y]=c[c.length-1],c.pop(),u.delete(x.cacheKey),x.destroy()}}function b(x){o.remove(x)}function P(){o.dispose()}return{getParameters:v,getProgramCacheKey:m,getUniforms:R,acquireProgram:S,releaseProgram:E,releaseShaderCache:b,programs:c,dispose:P}}function Lg(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,l){n.get(a)[o]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function Dg(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function Sc(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function yc(){const n=[];let e=0;const t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function a(h){let p=0;return h.isInstancedMesh&&(p+=2),h.isSkinnedMesh&&(p+=1),p}function o(h,p,_,v,m,f){let T=n[e];return T===void 0?(T={id:h.id,object:h,geometry:p,material:_,materialVariant:a(h),groupOrder:v,renderOrder:h.renderOrder,z:m,group:f},n[e]=T):(T.id=h.id,T.object=h,T.geometry=p,T.material=_,T.materialVariant=a(h),T.groupOrder=v,T.renderOrder=h.renderOrder,T.z=m,T.group=f),e++,T}function l(h,p,_,v,m,f){const T=o(h,p,_,v,m,f);_.transmission>0?i.push(T):_.transparent===!0?s.push(T):t.push(T)}function c(h,p,_,v,m,f){const T=o(h,p,_,v,m,f);_.transmission>0?i.unshift(T):_.transparent===!0?s.unshift(T):t.unshift(T)}function u(h,p,_){t.length>1&&t.sort(h||Dg),i.length>1&&i.sort(p||Sc),s.length>1&&s.sort(p||Sc),_&&(t.reverse(),i.reverse(),s.reverse())}function d(){for(let h=e,p=n.length;h<p;h++){const _=n[h];if(_.id===null)break;_.id=null,_.object=null,_.geometry=null,_.material=null,_.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:l,unshift:c,finish:d,sort:u}}function Ig(){let n=new WeakMap;function e(i,s){const r=n.get(i);let a;return r===void 0?(a=new yc,n.set(i,[a])):s>=r.length?(a=new yc,r.push(a)):a=r[s],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function Ug(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new I,color:new Ce};break;case"SpotLight":t={position:new I,direction:new I,color:new Ce,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new Ce,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new Ce,groundColor:new Ce};break;case"RectAreaLight":t={color:new Ce,position:new I,halfWidth:new I,halfHeight:new I};break}return n[e.id]=t,t}}}function Ng(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let Fg=0;function Og(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function zg(n){const e=new Ug,t=Ng(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new I);const s=new I,r=new gt,a=new gt;function o(c){let u=0,d=0,h=0;for(let y=0;y<9;y++)i.probe[y].set(0,0,0);let p=0,_=0,v=0,m=0,f=0,T=0,R=0,S=0,E=0,b=0,P=0;c.sort(Og);for(let y=0,A=c.length;y<A;y++){const C=c[y],L=C.color,O=C.intensity,B=C.distance;let F=null;if(C.shadow&&C.shadow.map&&(C.shadow.map.texture.format===In?F=C.shadow.map.texture:F=C.shadow.map.depthTexture||C.shadow.map.texture),C.isAmbientLight)u+=L.r*O,d+=L.g*O,h+=L.b*O;else if(C.isLightProbe){for(let k=0;k<9;k++)i.probe[k].addScaledVector(C.sh.coefficients[k],O);P++}else if(C.isDirectionalLight){const k=e.get(C);if(k.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){const V=C.shadow,Q=t.get(C);Q.shadowIntensity=V.intensity,Q.shadowBias=V.bias,Q.shadowNormalBias=V.normalBias,Q.shadowRadius=V.radius,Q.shadowMapSize=V.mapSize,i.directionalShadow[p]=Q,i.directionalShadowMap[p]=F,i.directionalShadowMatrix[p]=C.shadow.matrix,T++}i.directional[p]=k,p++}else if(C.isSpotLight){const k=e.get(C);k.position.setFromMatrixPosition(C.matrixWorld),k.color.copy(L).multiplyScalar(O),k.distance=B,k.coneCos=Math.cos(C.angle),k.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),k.decay=C.decay,i.spot[v]=k;const V=C.shadow;if(C.map&&(i.spotLightMap[E]=C.map,E++,V.updateMatrices(C),C.castShadow&&b++),i.spotLightMatrix[v]=V.matrix,C.castShadow){const Q=t.get(C);Q.shadowIntensity=V.intensity,Q.shadowBias=V.bias,Q.shadowNormalBias=V.normalBias,Q.shadowRadius=V.radius,Q.shadowMapSize=V.mapSize,i.spotShadow[v]=Q,i.spotShadowMap[v]=F,S++}v++}else if(C.isRectAreaLight){const k=e.get(C);k.color.copy(L).multiplyScalar(O),k.halfWidth.set(C.width*.5,0,0),k.halfHeight.set(0,C.height*.5,0),i.rectArea[m]=k,m++}else if(C.isPointLight){const k=e.get(C);if(k.color.copy(C.color).multiplyScalar(C.intensity),k.distance=C.distance,k.decay=C.decay,C.castShadow){const V=C.shadow,Q=t.get(C);Q.shadowIntensity=V.intensity,Q.shadowBias=V.bias,Q.shadowNormalBias=V.normalBias,Q.shadowRadius=V.radius,Q.shadowMapSize=V.mapSize,Q.shadowCameraNear=V.camera.near,Q.shadowCameraFar=V.camera.far,i.pointShadow[_]=Q,i.pointShadowMap[_]=F,i.pointShadowMatrix[_]=C.shadow.matrix,R++}i.point[_]=k,_++}else if(C.isHemisphereLight){const k=e.get(C);k.skyColor.copy(C.color).multiplyScalar(O),k.groundColor.copy(C.groundColor).multiplyScalar(O),i.hemi[f]=k,f++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=fe.LTC_FLOAT_1,i.rectAreaLTC2=fe.LTC_FLOAT_2):(i.rectAreaLTC1=fe.LTC_HALF_1,i.rectAreaLTC2=fe.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=d,i.ambient[2]=h;const x=i.hash;(x.directionalLength!==p||x.pointLength!==_||x.spotLength!==v||x.rectAreaLength!==m||x.hemiLength!==f||x.numDirectionalShadows!==T||x.numPointShadows!==R||x.numSpotShadows!==S||x.numSpotMaps!==E||x.numLightProbes!==P)&&(i.directional.length=p,i.spot.length=v,i.rectArea.length=m,i.point.length=_,i.hemi.length=f,i.directionalShadow.length=T,i.directionalShadowMap.length=T,i.pointShadow.length=R,i.pointShadowMap.length=R,i.spotShadow.length=S,i.spotShadowMap.length=S,i.directionalShadowMatrix.length=T,i.pointShadowMatrix.length=R,i.spotLightMatrix.length=S+E-b,i.spotLightMap.length=E,i.numSpotLightShadowsWithMaps=b,i.numLightProbes=P,x.directionalLength=p,x.pointLength=_,x.spotLength=v,x.rectAreaLength=m,x.hemiLength=f,x.numDirectionalShadows=T,x.numPointShadows=R,x.numSpotShadows=S,x.numSpotMaps=E,x.numLightProbes=P,i.version=Fg++)}function l(c,u){let d=0,h=0,p=0,_=0,v=0;const m=u.matrixWorldInverse;for(let f=0,T=c.length;f<T;f++){const R=c[f];if(R.isDirectionalLight){const S=i.directional[d];S.direction.setFromMatrixPosition(R.matrixWorld),s.setFromMatrixPosition(R.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),d++}else if(R.isSpotLight){const S=i.spot[p];S.position.setFromMatrixPosition(R.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(R.matrixWorld),s.setFromMatrixPosition(R.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),p++}else if(R.isRectAreaLight){const S=i.rectArea[_];S.position.setFromMatrixPosition(R.matrixWorld),S.position.applyMatrix4(m),a.identity(),r.copy(R.matrixWorld),r.premultiply(m),a.extractRotation(r),S.halfWidth.set(R.width*.5,0,0),S.halfHeight.set(0,R.height*.5,0),S.halfWidth.applyMatrix4(a),S.halfHeight.applyMatrix4(a),_++}else if(R.isPointLight){const S=i.point[h];S.position.setFromMatrixPosition(R.matrixWorld),S.position.applyMatrix4(m),h++}else if(R.isHemisphereLight){const S=i.hemi[v];S.direction.setFromMatrixPosition(R.matrixWorld),S.direction.transformDirection(m),v++}}}return{setup:o,setupView:l,state:i}}function bc(n){const e=new zg(n),t=[],i=[],s=[];function r(h){d.camera=h,t.length=0,i.length=0,s.length=0}function a(h){t.push(h)}function o(h){i.push(h)}function l(h){s.push(h)}function c(){e.setup(t)}function u(h){e.setupView(t,h)}const d={lightsArray:t,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function Bg(n){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new bc(n),e.set(s,[o])):r>=a.length?(o=new bc(n),a.push(o)):o=a[r],o}function i(){e=new WeakMap}return{get:t,dispose:i}}const kg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Gg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Hg=[new I(1,0,0),new I(-1,0,0),new I(0,1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1)],Vg=[new I(0,-1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1),new I(0,-1,0),new I(0,-1,0)],Ec=new gt,Ts=new I,Ra=new I;function Wg(n,e,t){let i=new Jo;const s=new Ue,r=new Ue,a=new xt,o=new Ju,l=new Qu,c={},u=t.maxTextureSize,d={[Mn]:ai,[ai]:Mn,[Bt]:Bt},h=new Kt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ue},radius:{value:4}},vertexShader:kg,fragmentShader:Gg}),p=h.clone();p.defines.HORIZONTAL_PASS=1;const _=new st;_.setAttribute("position",new pt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new ke(_,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Mr;let f=this.type;this.render=function(b,P,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||b.length===0)return;this.type===Hh&&(Ie("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Mr);const y=n.getRenderTarget(),A=n.getActiveCubeFace(),C=n.getActiveMipmapLevel(),L=n.state;L.setBlending(Vi),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);const O=f!==this.type;O&&P.traverse(function(B){B.material&&(Array.isArray(B.material)?B.material.forEach(F=>F.needsUpdate=!0):B.material.needsUpdate=!0)});for(let B=0,F=b.length;B<F;B++){const k=b[B],V=k.shadow;if(V===void 0){Ie("WebGLShadowMap:",k,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);const Q=V.getFrameExtents();s.multiply(Q),r.copy(V.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/Q.x),s.x=r.x*Q.x,V.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/Q.y),s.y=r.y*Q.y,V.mapSize.y=r.y));const te=n.state.buffers.depth.getReversed();if(V.camera._reversedDepth=te,V.map===null||O===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===Ps){if(k.isPointLight){Ie("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new oi(s.x,s.y,{format:In,type:mi,minFilter:Zt,magFilter:Zt,generateMipmaps:!1}),V.map.texture.name=k.name+".shadowMap",V.map.depthTexture=new os(s.x,s.y,Gi),V.map.depthTexture.name=k.name+".shadowMapDepth",V.map.depthTexture.format=rn,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Wt,V.map.depthTexture.magFilter=Wt}else k.isPointLight?(V.map=new dh(s.x),V.map.depthTexture=new Yu(s.x,Xi)):(V.map=new oi(s.x,s.y),V.map.depthTexture=new os(s.x,s.y,Xi)),V.map.depthTexture.name=k.name+".shadowMap",V.map.depthTexture.format=rn,this.type===Mr?(V.map.depthTexture.compareFunction=te?$o:Yo,V.map.depthTexture.minFilter=Zt,V.map.depthTexture.magFilter=Zt):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Wt,V.map.depthTexture.magFilter=Wt);V.camera.updateProjectionMatrix()}const se=V.map.isWebGLCubeRenderTarget?6:1;for(let pe=0;pe<se;pe++){if(V.map.isWebGLCubeRenderTarget)n.setRenderTarget(V.map,pe),n.clear();else{pe===0&&(n.setRenderTarget(V.map),n.clear());const ve=V.getViewport(pe);a.set(r.x*ve.x,r.y*ve.y,r.x*ve.z,r.y*ve.w),L.viewport(a)}if(k.isPointLight){const ve=V.camera,je=V.matrix,vt=k.distance||ve.far;vt!==ve.far&&(ve.far=vt,ve.updateProjectionMatrix()),Ts.setFromMatrixPosition(k.matrixWorld),ve.position.copy(Ts),Ra.copy(ve.position),Ra.add(Hg[pe]),ve.up.copy(Vg[pe]),ve.lookAt(Ra),ve.updateMatrixWorld(),je.makeTranslation(-Ts.x,-Ts.y,-Ts.z),Ec.multiplyMatrices(ve.projectionMatrix,ve.matrixWorldInverse),V._frustum.setFromProjectionMatrix(Ec,ve.coordinateSystem,ve.reversedDepth)}else V.updateMatrices(k);i=V.getFrustum(),S(P,x,V.camera,k,this.type)}V.isPointLightShadow!==!0&&this.type===Ps&&T(V,x),V.needsUpdate=!1}f=this.type,m.needsUpdate=!1,n.setRenderTarget(y,A,C)};function T(b,P){const x=e.update(v);h.defines.VSM_SAMPLES!==b.blurSamples&&(h.defines.VSM_SAMPLES=b.blurSamples,p.defines.VSM_SAMPLES=b.blurSamples,h.needsUpdate=!0,p.needsUpdate=!0),b.mapPass===null&&(b.mapPass=new oi(s.x,s.y,{format:In,type:mi})),h.uniforms.shadow_pass.value=b.map.depthTexture,h.uniforms.resolution.value=b.mapSize,h.uniforms.radius.value=b.radius,n.setRenderTarget(b.mapPass),n.clear(),n.renderBufferDirect(P,null,x,h,v,null),p.uniforms.shadow_pass.value=b.mapPass.texture,p.uniforms.resolution.value=b.mapSize,p.uniforms.radius.value=b.radius,n.setRenderTarget(b.map),n.clear(),n.renderBufferDirect(P,null,x,p,v,null)}function R(b,P,x,y){let A=null;const C=x.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(C!==void 0)A=C;else if(A=x.isPointLight===!0?l:o,n.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){const L=A.uuid,O=P.uuid;let B=c[L];B===void 0&&(B={},c[L]=B);let F=B[O];F===void 0&&(F=A.clone(),B[O]=F,P.addEventListener("dispose",E)),A=F}if(A.visible=P.visible,A.wireframe=P.wireframe,y===Ps?A.side=P.shadowSide!==null?P.shadowSide:P.side:A.side=P.shadowSide!==null?P.shadowSide:d[P.side],A.alphaMap=P.alphaMap,A.alphaTest=P.alphaToCoverage===!0?.5:P.alphaTest,A.map=P.map,A.clipShadows=P.clipShadows,A.clippingPlanes=P.clippingPlanes,A.clipIntersection=P.clipIntersection,A.displacementMap=P.displacementMap,A.displacementScale=P.displacementScale,A.displacementBias=P.displacementBias,A.wireframeLinewidth=P.wireframeLinewidth,A.linewidth=P.linewidth,x.isPointLight===!0&&A.isMeshDistanceMaterial===!0){const L=n.properties.get(A);L.light=x}return A}function S(b,P,x,y,A){if(b.visible===!1)return;if(b.layers.test(P.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&A===Ps)&&(!b.frustumCulled||i.intersectsObject(b))){b.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,b.matrixWorld);const O=e.update(b),B=b.material;if(Array.isArray(B)){const F=O.groups;for(let k=0,V=F.length;k<V;k++){const Q=F[k],te=B[Q.materialIndex];if(te&&te.visible){const se=R(b,te,y,A);b.onBeforeShadow(n,b,P,x,O,se,Q),n.renderBufferDirect(x,null,O,se,b,Q),b.onAfterShadow(n,b,P,x,O,se,Q)}}}else if(B.visible){const F=R(b,B,y,A);b.onBeforeShadow(n,b,P,x,O,F,null),n.renderBufferDirect(x,null,O,F,b,null),b.onAfterShadow(n,b,P,x,O,F,null)}}const L=b.children;for(let O=0,B=L.length;O<B;O++)S(L[O],P,x,y,A)}function E(b){b.target.removeEventListener("dispose",E);for(const x in c){const y=c[x],A=b.target.uuid;A in y&&(y[A].dispose(),delete y[A])}}}function Xg(n,e){function t(){let D=!1;const re=new xt;let $=null;const he=new xt(0,0,0,0);return{setMask:function(_e){$!==_e&&!D&&(n.colorMask(_e,_e,_e,_e),$=_e)},setLocked:function(_e){D=_e},setClear:function(_e,j,Ee,Se,St){St===!0&&(_e*=Se,j*=Se,Ee*=Se),re.set(_e,j,Ee,Se),he.equals(re)===!1&&(n.clearColor(_e,j,Ee,Se),he.copy(re))},reset:function(){D=!1,$=null,he.set(-1,0,0,0)}}}function i(){let D=!1,re=!1,$=null,he=null,_e=null;return{setReversed:function(j){if(re!==j){const Ee=e.get("EXT_clip_control");j?Ee.clipControlEXT(Ee.LOWER_LEFT_EXT,Ee.ZERO_TO_ONE_EXT):Ee.clipControlEXT(Ee.LOWER_LEFT_EXT,Ee.NEGATIVE_ONE_TO_ONE_EXT),re=j;const Se=_e;_e=null,this.setClear(Se)}},getReversed:function(){return re},setTest:function(j){j?ie(n.DEPTH_TEST):Ne(n.DEPTH_TEST)},setMask:function(j){$!==j&&!D&&(n.depthMask(j),$=j)},setFunc:function(j){if(re&&(j=Su[j]),he!==j){switch(j){case Fa:n.depthFunc(n.NEVER);break;case Oa:n.depthFunc(n.ALWAYS);break;case za:n.depthFunc(n.LESS);break;case rs:n.depthFunc(n.LEQUAL);break;case Ba:n.depthFunc(n.EQUAL);break;case ka:n.depthFunc(n.GEQUAL);break;case Ga:n.depthFunc(n.GREATER);break;case Ha:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}he=j}},setLocked:function(j){D=j},setClear:function(j){_e!==j&&(_e=j,re&&(j=1-j),n.clearDepth(j))},reset:function(){D=!1,$=null,he=null,_e=null,re=!1}}}function s(){let D=!1,re=null,$=null,he=null,_e=null,j=null,Ee=null,Se=null,St=null;return{setTest:function(dt){D||(dt?ie(n.STENCIL_TEST):Ne(n.STENCIL_TEST))},setMask:function(dt){re!==dt&&!D&&(n.stencilMask(dt),re=dt)},setFunc:function(dt,Ii,Ui){($!==dt||he!==Ii||_e!==Ui)&&(n.stencilFunc(dt,Ii,Ui),$=dt,he=Ii,_e=Ui)},setOp:function(dt,Ii,Ui){(j!==dt||Ee!==Ii||Se!==Ui)&&(n.stencilOp(dt,Ii,Ui),j=dt,Ee=Ii,Se=Ui)},setLocked:function(dt){D=dt},setClear:function(dt){St!==dt&&(n.clearStencil(dt),St=dt)},reset:function(){D=!1,re=null,$=null,he=null,_e=null,j=null,Ee=null,Se=null,St=null}}}const r=new t,a=new i,o=new s,l=new WeakMap,c=new WeakMap;let u={},d={},h={},p=new WeakMap,_=[],v=null,m=!1,f=null,T=null,R=null,S=null,E=null,b=null,P=null,x=new Ce(0,0,0),y=0,A=!1,C=null,L=null,O=null,B=null,F=null;const k=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let V=!1,Q=0;const te=n.getParameter(n.VERSION);te.indexOf("WebGL")!==-1?(Q=parseFloat(/^WebGL (\d)/.exec(te)[1]),V=Q>=1):te.indexOf("OpenGL ES")!==-1&&(Q=parseFloat(/^OpenGL ES (\d)/.exec(te)[1]),V=Q>=2);let se=null,pe={};const ve=n.getParameter(n.SCISSOR_BOX),je=n.getParameter(n.VIEWPORT),vt=new xt().fromArray(ve),et=new xt().fromArray(je);function K(D,re,$,he){const _e=new Uint8Array(4),j=n.createTexture();n.bindTexture(D,j),n.texParameteri(D,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(D,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ee=0;Ee<$;Ee++)D===n.TEXTURE_3D||D===n.TEXTURE_2D_ARRAY?n.texImage3D(re,0,n.RGBA,1,1,he,0,n.RGBA,n.UNSIGNED_BYTE,_e):n.texImage2D(re+Ee,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,_e);return j}const ae={};ae[n.TEXTURE_2D]=K(n.TEXTURE_2D,n.TEXTURE_2D,1),ae[n.TEXTURE_CUBE_MAP]=K(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),ae[n.TEXTURE_2D_ARRAY]=K(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),ae[n.TEXTURE_3D]=K(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ie(n.DEPTH_TEST),a.setFunc(rs),Ct(!1),Dt(Ml),ie(n.CULL_FACE),tt(Vi);function ie(D){u[D]!==!0&&(n.enable(D),u[D]=!0)}function Ne(D){u[D]!==!1&&(n.disable(D),u[D]=!1)}function Oe(D,re){return h[D]!==re?(n.bindFramebuffer(D,re),h[D]=re,D===n.DRAW_FRAMEBUFFER&&(h[n.FRAMEBUFFER]=re),D===n.FRAMEBUFFER&&(h[n.DRAW_FRAMEBUFFER]=re),!0):!1}function Pe(D,re){let $=_,he=!1;if(D){$=p.get(re),$===void 0&&($=[],p.set(re,$));const _e=D.textures;if($.length!==_e.length||$[0]!==n.COLOR_ATTACHMENT0){for(let j=0,Ee=_e.length;j<Ee;j++)$[j]=n.COLOR_ATTACHMENT0+j;$.length=_e.length,he=!0}}else $[0]!==n.BACK&&($[0]=n.BACK,he=!0);he&&n.drawBuffers($)}function Tt(D){return v!==D?(n.useProgram(D),v=D,!0):!1}const Xe={[Rn]:n.FUNC_ADD,[Wh]:n.FUNC_SUBTRACT,[Xh]:n.FUNC_REVERSE_SUBTRACT};Xe[qh]=n.MIN,Xe[Yh]=n.MAX;const lt={[$h]:n.ZERO,[Zh]:n.ONE,[Kh]:n.SRC_COLOR,[Ua]:n.SRC_ALPHA,[iu]:n.SRC_ALPHA_SATURATE,[eu]:n.DST_COLOR,[Qh]:n.DST_ALPHA,[Jh]:n.ONE_MINUS_SRC_COLOR,[Na]:n.ONE_MINUS_SRC_ALPHA,[tu]:n.ONE_MINUS_DST_COLOR,[jh]:n.ONE_MINUS_DST_ALPHA,[nu]:n.CONSTANT_COLOR,[su]:n.ONE_MINUS_CONSTANT_COLOR,[ru]:n.CONSTANT_ALPHA,[au]:n.ONE_MINUS_CONSTANT_ALPHA};function tt(D,re,$,he,_e,j,Ee,Se,St,dt){if(D===Vi){m===!0&&(Ne(n.BLEND),m=!1);return}if(m===!1&&(ie(n.BLEND),m=!0),D!==Vh){if(D!==f||dt!==A){if((T!==Rn||E!==Rn)&&(n.blendEquation(n.FUNC_ADD),T=Rn,E=Rn),dt)switch(D){case es:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case _t:n.blendFunc(n.ONE,n.ONE);break;case Sl:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case yl:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Qe("WebGLState: Invalid blending: ",D);break}else switch(D){case es:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case _t:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Sl:Qe("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case yl:Qe("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Qe("WebGLState: Invalid blending: ",D);break}R=null,S=null,b=null,P=null,x.set(0,0,0),y=0,f=D,A=dt}return}_e=_e||re,j=j||$,Ee=Ee||he,(re!==T||_e!==E)&&(n.blendEquationSeparate(Xe[re],Xe[_e]),T=re,E=_e),($!==R||he!==S||j!==b||Ee!==P)&&(n.blendFuncSeparate(lt[$],lt[he],lt[j],lt[Ee]),R=$,S=he,b=j,P=Ee),(Se.equals(x)===!1||St!==y)&&(n.blendColor(Se.r,Se.g,Se.b,St),x.copy(Se),y=St),f=D,A=!1}function Ke(D,re){D.side===Bt?Ne(n.CULL_FACE):ie(n.CULL_FACE);let $=D.side===ai;re&&($=!$),Ct($),D.blending===es&&D.transparent===!1?tt(Vi):tt(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),a.setFunc(D.depthFunc),a.setTest(D.depthTest),a.setMask(D.depthWrite),r.setMask(D.colorWrite);const he=D.stencilWrite;o.setTest(he),he&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Ht(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?ie(n.SAMPLE_ALPHA_TO_COVERAGE):Ne(n.SAMPLE_ALPHA_TO_COVERAGE)}function Ct(D){C!==D&&(D?n.frontFace(n.CW):n.frontFace(n.CCW),C=D)}function Dt(D){D!==kh?(ie(n.CULL_FACE),D!==L&&(D===Ml?n.cullFace(n.BACK):D===Gh?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Ne(n.CULL_FACE),L=D}function Ft(D){D!==O&&(V&&n.lineWidth(D),O=D)}function Ht(D,re,$){D?(ie(n.POLYGON_OFFSET_FILL),(B!==re||F!==$)&&(B=re,F=$,a.getReversed()&&(re=-re),n.polygonOffset(re,$))):Ne(n.POLYGON_OFFSET_FILL)}function Mt(D){D?ie(n.SCISSOR_TEST):Ne(n.SCISSOR_TEST)}function Pt(D){D===void 0&&(D=n.TEXTURE0+k-1),se!==D&&(n.activeTexture(D),se=D)}function U(D,re,$){$===void 0&&(se===null?$=n.TEXTURE0+k-1:$=se);let he=pe[$];he===void 0&&(he={type:void 0,texture:void 0},pe[$]=he),(he.type!==D||he.texture!==re)&&(se!==$&&(n.activeTexture($),se=$),n.bindTexture(D,re||ae[D]),he.type=D,he.texture=re)}function ti(){const D=pe[se];D!==void 0&&D.type!==void 0&&(n.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function rt(){try{n.compressedTexImage2D(...arguments)}catch(D){Qe("WebGLState:",D)}}function w(){try{n.compressedTexImage3D(...arguments)}catch(D){Qe("WebGLState:",D)}}function g(){try{n.texSubImage2D(...arguments)}catch(D){Qe("WebGLState:",D)}}function z(){try{n.texSubImage3D(...arguments)}catch(D){Qe("WebGLState:",D)}}function W(){try{n.compressedTexSubImage2D(...arguments)}catch(D){Qe("WebGLState:",D)}}function q(){try{n.compressedTexSubImage3D(...arguments)}catch(D){Qe("WebGLState:",D)}}function ne(){try{n.texStorage2D(...arguments)}catch(D){Qe("WebGLState:",D)}}function oe(){try{n.texStorage3D(...arguments)}catch(D){Qe("WebGLState:",D)}}function Y(){try{n.texImage2D(...arguments)}catch(D){Qe("WebGLState:",D)}}function Z(){try{n.texImage3D(...arguments)}catch(D){Qe("WebGLState:",D)}}function le(D){return d[D]!==void 0?d[D]:n.getParameter(D)}function Te(D,re){d[D]!==re&&(n.pixelStorei(D,re),d[D]=re)}function de(D){vt.equals(D)===!1&&(n.scissor(D.x,D.y,D.z,D.w),vt.copy(D))}function ce(D){et.equals(D)===!1&&(n.viewport(D.x,D.y,D.z,D.w),et.copy(D))}function Re(D,re){let $=c.get(re);$===void 0&&($=new WeakMap,c.set(re,$));let he=$.get(D);he===void 0&&(he=n.getUniformBlockIndex(re,D.name),$.set(D,he))}function Le(D,re){const he=c.get(re).get(D);l.get(re)!==he&&(n.uniformBlockBinding(re,he,D.__bindingPointIndex),l.set(re,he))}function ze(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),u={},d={},se=null,pe={},h={},p=new WeakMap,_=[],v=null,m=!1,f=null,T=null,R=null,S=null,E=null,b=null,P=null,x=new Ce(0,0,0),y=0,A=!1,C=null,L=null,O=null,B=null,F=null,vt.set(0,0,n.canvas.width,n.canvas.height),et.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ie,disable:Ne,bindFramebuffer:Oe,drawBuffers:Pe,useProgram:Tt,setBlending:tt,setMaterial:Ke,setFlipSided:Ct,setCullFace:Dt,setLineWidth:Ft,setPolygonOffset:Ht,setScissorTest:Mt,activeTexture:Pt,bindTexture:U,unbindTexture:ti,compressedTexImage2D:rt,compressedTexImage3D:w,texImage2D:Y,texImage3D:Z,pixelStorei:Te,getParameter:le,updateUBOMapping:Re,uniformBlockBinding:Le,texStorage2D:ne,texStorage3D:oe,texSubImage2D:g,texSubImage3D:z,compressedTexSubImage2D:W,compressedTexSubImage3D:q,scissor:de,viewport:ce,reset:ze}}function qg(n,e,t,i,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ue,u=new WeakMap,d=new Set;let h;const p=new WeakMap;let _=!1;try{_=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(w,g){return _?new OffscreenCanvas(w,g):Lr("canvas")}function m(w,g,z){let W=1;const q=rt(w);if((q.width>z||q.height>z)&&(W=z/Math.max(q.width,q.height)),W<1)if(typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&w instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&w instanceof ImageBitmap||typeof VideoFrame<"u"&&w instanceof VideoFrame){const ne=Math.floor(W*q.width),oe=Math.floor(W*q.height);h===void 0&&(h=v(ne,oe));const Y=g?v(ne,oe):h;return Y.width=ne,Y.height=oe,Y.getContext("2d").drawImage(w,0,0,ne,oe),Ie("WebGLRenderer: Texture has been resized from ("+q.width+"x"+q.height+") to ("+ne+"x"+oe+")."),Y}else return"data"in w&&Ie("WebGLRenderer: Image in DataTexture is too big ("+q.width+"x"+q.height+")."),w;return w}function f(w){return w.generateMipmaps}function T(w){n.generateMipmap(w)}function R(w){return w.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:w.isWebGL3DRenderTarget?n.TEXTURE_3D:w.isWebGLArrayRenderTarget||w.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function S(w,g,z,W,q,ne=!1){if(w!==null){if(n[w]!==void 0)return n[w];Ie("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+w+"'")}let oe;W&&(oe=e.get("EXT_texture_norm16"),oe||Ie("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Y=g;if(g===n.RED&&(z===n.FLOAT&&(Y=n.R32F),z===n.HALF_FLOAT&&(Y=n.R16F),z===n.UNSIGNED_BYTE&&(Y=n.R8),z===n.UNSIGNED_SHORT&&oe&&(Y=oe.R16_EXT),z===n.SHORT&&oe&&(Y=oe.R16_SNORM_EXT)),g===n.RED_INTEGER&&(z===n.UNSIGNED_BYTE&&(Y=n.R8UI),z===n.UNSIGNED_SHORT&&(Y=n.R16UI),z===n.UNSIGNED_INT&&(Y=n.R32UI),z===n.BYTE&&(Y=n.R8I),z===n.SHORT&&(Y=n.R16I),z===n.INT&&(Y=n.R32I)),g===n.RG&&(z===n.FLOAT&&(Y=n.RG32F),z===n.HALF_FLOAT&&(Y=n.RG16F),z===n.UNSIGNED_BYTE&&(Y=n.RG8),z===n.UNSIGNED_SHORT&&oe&&(Y=oe.RG16_EXT),z===n.SHORT&&oe&&(Y=oe.RG16_SNORM_EXT)),g===n.RG_INTEGER&&(z===n.UNSIGNED_BYTE&&(Y=n.RG8UI),z===n.UNSIGNED_SHORT&&(Y=n.RG16UI),z===n.UNSIGNED_INT&&(Y=n.RG32UI),z===n.BYTE&&(Y=n.RG8I),z===n.SHORT&&(Y=n.RG16I),z===n.INT&&(Y=n.RG32I)),g===n.RGB_INTEGER&&(z===n.UNSIGNED_BYTE&&(Y=n.RGB8UI),z===n.UNSIGNED_SHORT&&(Y=n.RGB16UI),z===n.UNSIGNED_INT&&(Y=n.RGB32UI),z===n.BYTE&&(Y=n.RGB8I),z===n.SHORT&&(Y=n.RGB16I),z===n.INT&&(Y=n.RGB32I)),g===n.RGBA_INTEGER&&(z===n.UNSIGNED_BYTE&&(Y=n.RGBA8UI),z===n.UNSIGNED_SHORT&&(Y=n.RGBA16UI),z===n.UNSIGNED_INT&&(Y=n.RGBA32UI),z===n.BYTE&&(Y=n.RGBA8I),z===n.SHORT&&(Y=n.RGBA16I),z===n.INT&&(Y=n.RGBA32I)),g===n.RGB&&(z===n.UNSIGNED_SHORT&&oe&&(Y=oe.RGB16_EXT),z===n.SHORT&&oe&&(Y=oe.RGB16_SNORM_EXT),z===n.UNSIGNED_INT_5_9_9_9_REV&&(Y=n.RGB9_E5),z===n.UNSIGNED_INT_10F_11F_11F_REV&&(Y=n.R11F_G11F_B10F)),g===n.RGBA){const Z=ne?Pr:qe.getTransfer(q);z===n.FLOAT&&(Y=n.RGBA32F),z===n.HALF_FLOAT&&(Y=n.RGBA16F),z===n.UNSIGNED_BYTE&&(Y=Z===nt?n.SRGB8_ALPHA8:n.RGBA8),z===n.UNSIGNED_SHORT&&oe&&(Y=oe.RGBA16_EXT),z===n.SHORT&&oe&&(Y=oe.RGBA16_SNORM_EXT),z===n.UNSIGNED_SHORT_4_4_4_4&&(Y=n.RGBA4),z===n.UNSIGNED_SHORT_5_5_5_1&&(Y=n.RGB5_A1)}return(Y===n.R16F||Y===n.R32F||Y===n.RG16F||Y===n.RG32F||Y===n.RGBA16F||Y===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function E(w,g){let z;return w?g===null||g===Xi||g===Ns?z=n.DEPTH24_STENCIL8:g===Gi?z=n.DEPTH32F_STENCIL8:g===Us&&(z=n.DEPTH24_STENCIL8,Ie("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):g===null||g===Xi||g===Ns?z=n.DEPTH_COMPONENT24:g===Gi?z=n.DEPTH_COMPONENT32F:g===Us&&(z=n.DEPTH_COMPONENT16),z}function b(w,g){return f(w)===!0||w.isFramebufferTexture&&w.minFilter!==Wt&&w.minFilter!==Zt?Math.log2(Math.max(g.width,g.height))+1:w.mipmaps!==void 0&&w.mipmaps.length>0?w.mipmaps.length:w.isCompressedTexture&&Array.isArray(w.image)?g.mipmaps.length:1}function P(w){const g=w.target;g.removeEventListener("dispose",P),y(g),g.isVideoTexture&&u.delete(g),g.isHTMLTexture&&d.delete(g)}function x(w){const g=w.target;g.removeEventListener("dispose",x),C(g)}function y(w){const g=i.get(w);if(g.__webglInit===void 0)return;const z=w.source,W=p.get(z);if(W){const q=W[g.__cacheKey];q.usedTimes--,q.usedTimes===0&&A(w),Object.keys(W).length===0&&p.delete(z)}i.remove(w)}function A(w){const g=i.get(w);n.deleteTexture(g.__webglTexture);const z=w.source,W=p.get(z);delete W[g.__cacheKey],a.memory.textures--}function C(w){const g=i.get(w);if(w.depthTexture&&(w.depthTexture.dispose(),i.remove(w.depthTexture)),w.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(g.__webglFramebuffer[W]))for(let q=0;q<g.__webglFramebuffer[W].length;q++)n.deleteFramebuffer(g.__webglFramebuffer[W][q]);else n.deleteFramebuffer(g.__webglFramebuffer[W]);g.__webglDepthbuffer&&n.deleteRenderbuffer(g.__webglDepthbuffer[W])}else{if(Array.isArray(g.__webglFramebuffer))for(let W=0;W<g.__webglFramebuffer.length;W++)n.deleteFramebuffer(g.__webglFramebuffer[W]);else n.deleteFramebuffer(g.__webglFramebuffer);if(g.__webglDepthbuffer&&n.deleteRenderbuffer(g.__webglDepthbuffer),g.__webglMultisampledFramebuffer&&n.deleteFramebuffer(g.__webglMultisampledFramebuffer),g.__webglColorRenderbuffer)for(let W=0;W<g.__webglColorRenderbuffer.length;W++)g.__webglColorRenderbuffer[W]&&n.deleteRenderbuffer(g.__webglColorRenderbuffer[W]);g.__webglDepthRenderbuffer&&n.deleteRenderbuffer(g.__webglDepthRenderbuffer)}const z=w.textures;for(let W=0,q=z.length;W<q;W++){const ne=i.get(z[W]);ne.__webglTexture&&(n.deleteTexture(ne.__webglTexture),a.memory.textures--),i.remove(z[W])}i.remove(w)}let L=0;function O(){L=0}function B(){return L}function F(w){L=w}function k(){const w=L;return w>=s.maxTextures&&Ie("WebGLTextures: Trying to use "+w+" texture units while this GPU supports only "+s.maxTextures),L+=1,w}function V(w){const g=[];return g.push(w.wrapS),g.push(w.wrapT),g.push(w.wrapR||0),g.push(w.magFilter),g.push(w.minFilter),g.push(w.anisotropy),g.push(w.internalFormat),g.push(w.format),g.push(w.type),g.push(w.generateMipmaps),g.push(w.premultiplyAlpha),g.push(w.flipY),g.push(w.unpackAlignment),g.push(w.colorSpace),g.join()}function Q(w,g){const z=i.get(w);if(w.isVideoTexture&&U(w),w.isRenderTargetTexture===!1&&w.isExternalTexture!==!0&&w.version>0&&z.__version!==w.version){const W=w.image;if(W===null)Ie("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Ie("WebGLRenderer: Texture marked for update but image is incomplete");else{Ne(z,w,g);return}}else w.isExternalTexture&&(z.__webglTexture=w.sourceTexture?w.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,z.__webglTexture,n.TEXTURE0+g)}function te(w,g){const z=i.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&z.__version!==w.version){Ne(z,w,g);return}else w.isExternalTexture&&(z.__webglTexture=w.sourceTexture?w.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,z.__webglTexture,n.TEXTURE0+g)}function se(w,g){const z=i.get(w);if(w.isRenderTargetTexture===!1&&w.version>0&&z.__version!==w.version){Ne(z,w,g);return}t.bindTexture(n.TEXTURE_3D,z.__webglTexture,n.TEXTURE0+g)}function pe(w,g){const z=i.get(w);if(w.isCubeDepthTexture!==!0&&w.version>0&&z.__version!==w.version){Oe(z,w,g);return}t.bindTexture(n.TEXTURE_CUBE_MAP,z.__webglTexture,n.TEXTURE0+g)}const ve={[Va]:n.REPEAT,[en]:n.CLAMP_TO_EDGE,[Wa]:n.MIRRORED_REPEAT},je={[Wt]:n.NEAREST,[cu]:n.NEAREST_MIPMAP_NEAREST,[Xs]:n.NEAREST_MIPMAP_LINEAR,[Zt]:n.LINEAR,[Kr]:n.LINEAR_MIPMAP_NEAREST,[Pn]:n.LINEAR_MIPMAP_LINEAR},vt={[du]:n.NEVER,[_u]:n.ALWAYS,[fu]:n.LESS,[Yo]:n.LEQUAL,[pu]:n.EQUAL,[$o]:n.GEQUAL,[mu]:n.GREATER,[gu]:n.NOTEQUAL};function et(w,g){if(g.type===Gi&&e.has("OES_texture_float_linear")===!1&&(g.magFilter===Zt||g.magFilter===Kr||g.magFilter===Xs||g.magFilter===Pn||g.minFilter===Zt||g.minFilter===Kr||g.minFilter===Xs||g.minFilter===Pn)&&Ie("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(w,n.TEXTURE_WRAP_S,ve[g.wrapS]),n.texParameteri(w,n.TEXTURE_WRAP_T,ve[g.wrapT]),(w===n.TEXTURE_3D||w===n.TEXTURE_2D_ARRAY)&&n.texParameteri(w,n.TEXTURE_WRAP_R,ve[g.wrapR]),n.texParameteri(w,n.TEXTURE_MAG_FILTER,je[g.magFilter]),n.texParameteri(w,n.TEXTURE_MIN_FILTER,je[g.minFilter]),g.compareFunction&&(n.texParameteri(w,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(w,n.TEXTURE_COMPARE_FUNC,vt[g.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(g.magFilter===Wt||g.minFilter!==Xs&&g.minFilter!==Pn||g.type===Gi&&e.has("OES_texture_float_linear")===!1)return;if(g.anisotropy>1||i.get(g).__currentAnisotropy){const z=e.get("EXT_texture_filter_anisotropic");n.texParameterf(w,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(g.anisotropy,s.getMaxAnisotropy())),i.get(g).__currentAnisotropy=g.anisotropy}}}function K(w,g){let z=!1;w.__webglInit===void 0&&(w.__webglInit=!0,g.addEventListener("dispose",P));const W=g.source;let q=p.get(W);q===void 0&&(q={},p.set(W,q));const ne=V(g);if(ne!==w.__cacheKey){q[ne]===void 0&&(q[ne]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,z=!0),q[ne].usedTimes++;const oe=q[w.__cacheKey];oe!==void 0&&(q[w.__cacheKey].usedTimes--,oe.usedTimes===0&&A(g)),w.__cacheKey=ne,w.__webglTexture=q[ne].texture}return z}function ae(w,g,z){return Math.floor(Math.floor(w/z)/g)}function ie(w,g,z,W){const ne=w.updateRanges;if(ne.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,g.width,g.height,z,W,g.data);else{ne.sort((Te,de)=>Te.start-de.start);let oe=0;for(let Te=1;Te<ne.length;Te++){const de=ne[oe],ce=ne[Te],Re=de.start+de.count,Le=ae(ce.start,g.width,4),ze=ae(de.start,g.width,4);ce.start<=Re+1&&Le===ze&&ae(ce.start+ce.count-1,g.width,4)===Le?de.count=Math.max(de.count,ce.start+ce.count-de.start):(++oe,ne[oe]=ce)}ne.length=oe+1;const Y=t.getParameter(n.UNPACK_ROW_LENGTH),Z=t.getParameter(n.UNPACK_SKIP_PIXELS),le=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,g.width);for(let Te=0,de=ne.length;Te<de;Te++){const ce=ne[Te],Re=Math.floor(ce.start/4),Le=Math.ceil(ce.count/4),ze=Re%g.width,D=Math.floor(Re/g.width),re=Le,$=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,ze),t.pixelStorei(n.UNPACK_SKIP_ROWS,D),t.texSubImage2D(n.TEXTURE_2D,0,ze,D,re,$,z,W,g.data)}w.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,Y),t.pixelStorei(n.UNPACK_SKIP_PIXELS,Z),t.pixelStorei(n.UNPACK_SKIP_ROWS,le)}}function Ne(w,g,z){let W=n.TEXTURE_2D;(g.isDataArrayTexture||g.isCompressedArrayTexture)&&(W=n.TEXTURE_2D_ARRAY),g.isData3DTexture&&(W=n.TEXTURE_3D);const q=K(w,g),ne=g.source;t.bindTexture(W,w.__webglTexture,n.TEXTURE0+z);const oe=i.get(ne);if(ne.version!==oe.__version||q===!0){if(t.activeTexture(n.TEXTURE0+z),(typeof ImageBitmap<"u"&&g.image instanceof ImageBitmap)===!1){const $=qe.getPrimaries(qe.workingColorSpace),he=g.colorSpace===mn?null:qe.getPrimaries(g.colorSpace),_e=g.colorSpace===mn||$===he?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,g.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,_e)}t.pixelStorei(n.UNPACK_ALIGNMENT,g.unpackAlignment);let Z=m(g.image,!1,s.maxTextureSize);Z=ti(g,Z);const le=r.convert(g.format,g.colorSpace),Te=r.convert(g.type);let de=S(g.internalFormat,le,Te,g.normalized,g.colorSpace,g.isVideoTexture);et(W,g);let ce;const Re=g.mipmaps,Le=g.isVideoTexture!==!0,ze=oe.__version===void 0||q===!0,D=ne.dataReady,re=b(g,Z);if(g.isDepthTexture)de=E(g.format===Ln,g.type),ze&&(Le?t.texStorage2D(n.TEXTURE_2D,1,de,Z.width,Z.height):t.texImage2D(n.TEXTURE_2D,0,de,Z.width,Z.height,0,le,Te,null));else if(g.isDataTexture)if(Re.length>0){Le&&ze&&t.texStorage2D(n.TEXTURE_2D,re,de,Re[0].width,Re[0].height);for(let $=0,he=Re.length;$<he;$++)ce=Re[$],Le?D&&t.texSubImage2D(n.TEXTURE_2D,$,0,0,ce.width,ce.height,le,Te,ce.data):t.texImage2D(n.TEXTURE_2D,$,de,ce.width,ce.height,0,le,Te,ce.data);g.generateMipmaps=!1}else Le?(ze&&t.texStorage2D(n.TEXTURE_2D,re,de,Z.width,Z.height),D&&ie(g,Z,le,Te)):t.texImage2D(n.TEXTURE_2D,0,de,Z.width,Z.height,0,le,Te,Z.data);else if(g.isCompressedTexture)if(g.isCompressedArrayTexture){Le&&ze&&t.texStorage3D(n.TEXTURE_2D_ARRAY,re,de,Re[0].width,Re[0].height,Z.depth);for(let $=0,he=Re.length;$<he;$++)if(ce=Re[$],g.format!==Ci)if(le!==null)if(Le){if(D)if(g.layerUpdates.size>0){const _e=tc(ce.width,ce.height,g.format,g.type);for(const j of g.layerUpdates){const Ee=ce.data.subarray(j*_e/ce.data.BYTES_PER_ELEMENT,(j+1)*_e/ce.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,$,0,0,j,ce.width,ce.height,1,le,Ee)}g.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,$,0,0,0,ce.width,ce.height,Z.depth,le,ce.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,$,de,ce.width,ce.height,Z.depth,0,ce.data,0,0);else Ie("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Le?D&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,$,0,0,0,ce.width,ce.height,Z.depth,le,Te,ce.data):t.texImage3D(n.TEXTURE_2D_ARRAY,$,de,ce.width,ce.height,Z.depth,0,le,Te,ce.data)}else{Le&&ze&&t.texStorage2D(n.TEXTURE_2D,re,de,Re[0].width,Re[0].height);for(let $=0,he=Re.length;$<he;$++)ce=Re[$],g.format!==Ci?le!==null?Le?D&&t.compressedTexSubImage2D(n.TEXTURE_2D,$,0,0,ce.width,ce.height,le,ce.data):t.compressedTexImage2D(n.TEXTURE_2D,$,de,ce.width,ce.height,0,ce.data):Ie("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Le?D&&t.texSubImage2D(n.TEXTURE_2D,$,0,0,ce.width,ce.height,le,Te,ce.data):t.texImage2D(n.TEXTURE_2D,$,de,ce.width,ce.height,0,le,Te,ce.data)}else if(g.isDataArrayTexture)if(Le){if(ze&&t.texStorage3D(n.TEXTURE_2D_ARRAY,re,de,Z.width,Z.height,Z.depth),D)if(g.layerUpdates.size>0){const $=tc(Z.width,Z.height,g.format,g.type);for(const he of g.layerUpdates){const _e=Z.data.subarray(he*$/Z.data.BYTES_PER_ELEMENT,(he+1)*$/Z.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,he,Z.width,Z.height,1,le,Te,_e)}g.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,Z.width,Z.height,Z.depth,le,Te,Z.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,de,Z.width,Z.height,Z.depth,0,le,Te,Z.data);else if(g.isData3DTexture)Le?(ze&&t.texStorage3D(n.TEXTURE_3D,re,de,Z.width,Z.height,Z.depth),D&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,Z.width,Z.height,Z.depth,le,Te,Z.data)):t.texImage3D(n.TEXTURE_3D,0,de,Z.width,Z.height,Z.depth,0,le,Te,Z.data);else if(g.isFramebufferTexture){if(ze)if(Le)t.texStorage2D(n.TEXTURE_2D,re,de,Z.width,Z.height);else{let $=Z.width,he=Z.height;for(let _e=0;_e<re;_e++)t.texImage2D(n.TEXTURE_2D,_e,de,$,he,0,le,Te,null),$>>=1,he>>=1}}else if(g.isHTMLTexture){if("texElementImage2D"in n){const $=n.canvas;if($.hasAttribute("layoutsubtree")||$.setAttribute("layoutsubtree","true"),Z.parentNode!==$){$.appendChild(Z),d.add(g),$.onpaint=he=>{const _e=he.changedElements;for(const j of d)_e.includes(j.image)&&(j.needsUpdate=!0)},$.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,Z);else{const _e=n.RGBA,j=n.RGBA,Ee=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,_e,j,Ee,Z)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(Re.length>0){if(Le&&ze){const $=rt(Re[0]);t.texStorage2D(n.TEXTURE_2D,re,de,$.width,$.height)}for(let $=0,he=Re.length;$<he;$++)ce=Re[$],Le?D&&t.texSubImage2D(n.TEXTURE_2D,$,0,0,le,Te,ce):t.texImage2D(n.TEXTURE_2D,$,de,le,Te,ce);g.generateMipmaps=!1}else if(Le){if(ze){const $=rt(Z);t.texStorage2D(n.TEXTURE_2D,re,de,$.width,$.height)}D&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,le,Te,Z)}else t.texImage2D(n.TEXTURE_2D,0,de,le,Te,Z);f(g)&&T(W),oe.__version=ne.version,g.onUpdate&&g.onUpdate(g)}w.__version=g.version}function Oe(w,g,z){if(g.image.length!==6)return;const W=K(w,g),q=g.source;t.bindTexture(n.TEXTURE_CUBE_MAP,w.__webglTexture,n.TEXTURE0+z);const ne=i.get(q);if(q.version!==ne.__version||W===!0){t.activeTexture(n.TEXTURE0+z);const oe=qe.getPrimaries(qe.workingColorSpace),Y=g.colorSpace===mn?null:qe.getPrimaries(g.colorSpace),Z=g.colorSpace===mn||oe===Y?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,g.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,g.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Z);const le=g.isCompressedTexture||g.image[0].isCompressedTexture,Te=g.image[0]&&g.image[0].isDataTexture,de=[];for(let j=0;j<6;j++)!le&&!Te?de[j]=m(g.image[j],!0,s.maxCubemapSize):de[j]=Te?g.image[j].image:g.image[j],de[j]=ti(g,de[j]);const ce=de[0],Re=r.convert(g.format,g.colorSpace),Le=r.convert(g.type),ze=S(g.internalFormat,Re,Le,g.normalized,g.colorSpace),D=g.isVideoTexture!==!0,re=ne.__version===void 0||W===!0,$=q.dataReady;let he=b(g,ce);et(n.TEXTURE_CUBE_MAP,g);let _e;if(le){D&&re&&t.texStorage2D(n.TEXTURE_CUBE_MAP,he,ze,ce.width,ce.height);for(let j=0;j<6;j++){_e=de[j].mipmaps;for(let Ee=0;Ee<_e.length;Ee++){const Se=_e[Ee];g.format!==Ci?Re!==null?D?$&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ee,0,0,Se.width,Se.height,Re,Se.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ee,ze,Se.width,Se.height,0,Se.data):Ie("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?$&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ee,0,0,Se.width,Se.height,Re,Le,Se.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ee,ze,Se.width,Se.height,0,Re,Le,Se.data)}}}else{if(_e=g.mipmaps,D&&re){_e.length>0&&he++;const j=rt(de[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,he,ze,j.width,j.height)}for(let j=0;j<6;j++)if(Te){D?$&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,de[j].width,de[j].height,Re,Le,de[j].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,ze,de[j].width,de[j].height,0,Re,Le,de[j].data);for(let Ee=0;Ee<_e.length;Ee++){const St=_e[Ee].image[j].image;D?$&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ee+1,0,0,St.width,St.height,Re,Le,St.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ee+1,ze,St.width,St.height,0,Re,Le,St.data)}}else{D?$&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,Re,Le,de[j]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,ze,Re,Le,de[j]);for(let Ee=0;Ee<_e.length;Ee++){const Se=_e[Ee];D?$&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ee+1,0,0,Re,Le,Se.image[j]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ee+1,ze,Re,Le,Se.image[j])}}}f(g)&&T(n.TEXTURE_CUBE_MAP),ne.__version=q.version,g.onUpdate&&g.onUpdate(g)}w.__version=g.version}function Pe(w,g,z,W,q,ne){const oe=r.convert(z.format,z.colorSpace),Y=r.convert(z.type),Z=S(z.internalFormat,oe,Y,z.normalized,z.colorSpace),le=i.get(g),Te=i.get(z);if(Te.__renderTarget=g,!le.__hasExternalTextures){const de=Math.max(1,g.width>>ne),ce=Math.max(1,g.height>>ne);q===n.TEXTURE_3D||q===n.TEXTURE_2D_ARRAY?t.texImage3D(q,ne,Z,de,ce,g.depth,0,oe,Y,null):t.texImage2D(q,ne,Z,de,ce,0,oe,Y,null)}t.bindFramebuffer(n.FRAMEBUFFER,w),Pt(g)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,W,q,Te.__webglTexture,0,Mt(g)):(q===n.TEXTURE_2D||q>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&q<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,W,q,Te.__webglTexture,ne),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Tt(w,g,z){if(n.bindRenderbuffer(n.RENDERBUFFER,w),g.depthBuffer){const W=g.depthTexture,q=W&&W.isDepthTexture?W.type:null,ne=E(g.stencilBuffer,q),oe=g.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;Pt(g)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Mt(g),ne,g.width,g.height):z?n.renderbufferStorageMultisample(n.RENDERBUFFER,Mt(g),ne,g.width,g.height):n.renderbufferStorage(n.RENDERBUFFER,ne,g.width,g.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,oe,n.RENDERBUFFER,w)}else{const W=g.textures;for(let q=0;q<W.length;q++){const ne=W[q],oe=r.convert(ne.format,ne.colorSpace),Y=r.convert(ne.type),Z=S(ne.internalFormat,oe,Y,ne.normalized,ne.colorSpace);Pt(g)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Mt(g),Z,g.width,g.height):z?n.renderbufferStorageMultisample(n.RENDERBUFFER,Mt(g),Z,g.width,g.height):n.renderbufferStorage(n.RENDERBUFFER,Z,g.width,g.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Xe(w,g,z){const W=g.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,w),!(g.depthTexture&&g.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const q=i.get(g.depthTexture);if(q.__renderTarget=g,(!q.__webglTexture||g.depthTexture.image.width!==g.width||g.depthTexture.image.height!==g.height)&&(g.depthTexture.image.width=g.width,g.depthTexture.image.height=g.height,g.depthTexture.needsUpdate=!0),W){if(q.__webglInit===void 0&&(q.__webglInit=!0,g.depthTexture.addEventListener("dispose",P)),q.__webglTexture===void 0){q.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,q.__webglTexture),et(n.TEXTURE_CUBE_MAP,g.depthTexture);const le=r.convert(g.depthTexture.format),Te=r.convert(g.depthTexture.type);let de;g.depthTexture.format===rn?de=n.DEPTH_COMPONENT24:g.depthTexture.format===Ln&&(de=n.DEPTH24_STENCIL8);for(let ce=0;ce<6;ce++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,de,g.width,g.height,0,le,Te,null)}}else Q(g.depthTexture,0);const ne=q.__webglTexture,oe=Mt(g),Y=W?n.TEXTURE_CUBE_MAP_POSITIVE_X+z:n.TEXTURE_2D,Z=g.depthTexture.format===Ln?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(g.depthTexture.format===rn)Pt(g)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Z,Y,ne,0,oe):n.framebufferTexture2D(n.FRAMEBUFFER,Z,Y,ne,0);else if(g.depthTexture.format===Ln)Pt(g)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Z,Y,ne,0,oe):n.framebufferTexture2D(n.FRAMEBUFFER,Z,Y,ne,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function lt(w){const g=i.get(w),z=w.isWebGLCubeRenderTarget===!0;if(g.__boundDepthTexture!==w.depthTexture){const W=w.depthTexture;if(g.__depthDisposeCallback&&g.__depthDisposeCallback(),W){const q=()=>{delete g.__boundDepthTexture,delete g.__depthDisposeCallback,W.removeEventListener("dispose",q)};W.addEventListener("dispose",q),g.__depthDisposeCallback=q}g.__boundDepthTexture=W}if(w.depthTexture&&!g.__autoAllocateDepthBuffer)if(z)for(let W=0;W<6;W++)Xe(g.__webglFramebuffer[W],w,W);else{const W=w.texture.mipmaps;W&&W.length>0?Xe(g.__webglFramebuffer[0],w,0):Xe(g.__webglFramebuffer,w,0)}else if(z){g.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(n.FRAMEBUFFER,g.__webglFramebuffer[W]),g.__webglDepthbuffer[W]===void 0)g.__webglDepthbuffer[W]=n.createRenderbuffer(),Tt(g.__webglDepthbuffer[W],w,!1);else{const q=w.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ne=g.__webglDepthbuffer[W];n.bindRenderbuffer(n.RENDERBUFFER,ne),n.framebufferRenderbuffer(n.FRAMEBUFFER,q,n.RENDERBUFFER,ne)}}else{const W=w.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(n.FRAMEBUFFER,g.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,g.__webglFramebuffer),g.__webglDepthbuffer===void 0)g.__webglDepthbuffer=n.createRenderbuffer(),Tt(g.__webglDepthbuffer,w,!1);else{const q=w.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ne=g.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ne),n.framebufferRenderbuffer(n.FRAMEBUFFER,q,n.RENDERBUFFER,ne)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function tt(w,g,z){const W=i.get(w);g!==void 0&&Pe(W.__webglFramebuffer,w,w.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),z!==void 0&&lt(w)}function Ke(w){const g=w.texture,z=i.get(w),W=i.get(g);w.addEventListener("dispose",x);const q=w.textures,ne=w.isWebGLCubeRenderTarget===!0,oe=q.length>1;if(oe||(W.__webglTexture===void 0&&(W.__webglTexture=n.createTexture()),W.__version=g.version,a.memory.textures++),ne){z.__webglFramebuffer=[];for(let Y=0;Y<6;Y++)if(g.mipmaps&&g.mipmaps.length>0){z.__webglFramebuffer[Y]=[];for(let Z=0;Z<g.mipmaps.length;Z++)z.__webglFramebuffer[Y][Z]=n.createFramebuffer()}else z.__webglFramebuffer[Y]=n.createFramebuffer()}else{if(g.mipmaps&&g.mipmaps.length>0){z.__webglFramebuffer=[];for(let Y=0;Y<g.mipmaps.length;Y++)z.__webglFramebuffer[Y]=n.createFramebuffer()}else z.__webglFramebuffer=n.createFramebuffer();if(oe)for(let Y=0,Z=q.length;Y<Z;Y++){const le=i.get(q[Y]);le.__webglTexture===void 0&&(le.__webglTexture=n.createTexture(),a.memory.textures++)}if(w.samples>0&&Pt(w)===!1){z.__webglMultisampledFramebuffer=n.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let Y=0;Y<q.length;Y++){const Z=q[Y];z.__webglColorRenderbuffer[Y]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,z.__webglColorRenderbuffer[Y]);const le=r.convert(Z.format,Z.colorSpace),Te=r.convert(Z.type),de=S(Z.internalFormat,le,Te,Z.normalized,Z.colorSpace,w.isXRRenderTarget===!0),ce=Mt(w);n.renderbufferStorageMultisample(n.RENDERBUFFER,ce,de,w.width,w.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Y,n.RENDERBUFFER,z.__webglColorRenderbuffer[Y])}n.bindRenderbuffer(n.RENDERBUFFER,null),w.depthBuffer&&(z.__webglDepthRenderbuffer=n.createRenderbuffer(),Tt(z.__webglDepthRenderbuffer,w,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ne){t.bindTexture(n.TEXTURE_CUBE_MAP,W.__webglTexture),et(n.TEXTURE_CUBE_MAP,g);for(let Y=0;Y<6;Y++)if(g.mipmaps&&g.mipmaps.length>0)for(let Z=0;Z<g.mipmaps.length;Z++)Pe(z.__webglFramebuffer[Y][Z],w,g,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,Z);else Pe(z.__webglFramebuffer[Y],w,g,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0);f(g)&&T(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(oe){for(let Y=0,Z=q.length;Y<Z;Y++){const le=q[Y],Te=i.get(le);let de=n.TEXTURE_2D;(w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(de=w.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(de,Te.__webglTexture),et(de,le),Pe(z.__webglFramebuffer,w,le,n.COLOR_ATTACHMENT0+Y,de,0),f(le)&&T(de)}t.unbindTexture()}else{let Y=n.TEXTURE_2D;if((w.isWebGL3DRenderTarget||w.isWebGLArrayRenderTarget)&&(Y=w.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Y,W.__webglTexture),et(Y,g),g.mipmaps&&g.mipmaps.length>0)for(let Z=0;Z<g.mipmaps.length;Z++)Pe(z.__webglFramebuffer[Z],w,g,n.COLOR_ATTACHMENT0,Y,Z);else Pe(z.__webglFramebuffer,w,g,n.COLOR_ATTACHMENT0,Y,0);f(g)&&T(Y),t.unbindTexture()}w.depthBuffer&&lt(w)}function Ct(w){const g=w.textures;for(let z=0,W=g.length;z<W;z++){const q=g[z];if(f(q)){const ne=R(w),oe=i.get(q).__webglTexture;t.bindTexture(ne,oe),T(ne),t.unbindTexture()}}}const Dt=[],Ft=[];function Ht(w){if(w.samples>0){if(Pt(w)===!1){const g=w.textures,z=w.width,W=w.height;let q=n.COLOR_BUFFER_BIT;const ne=w.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,oe=i.get(w),Y=g.length>1;if(Y)for(let le=0;le<g.length;le++)t.bindFramebuffer(n.FRAMEBUFFER,oe.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+le,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,oe.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+le,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,oe.__webglMultisampledFramebuffer);const Z=w.texture.mipmaps;Z&&Z.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,oe.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,oe.__webglFramebuffer);for(let le=0;le<g.length;le++){if(w.resolveDepthBuffer&&(w.depthBuffer&&(q|=n.DEPTH_BUFFER_BIT),w.stencilBuffer&&w.resolveStencilBuffer&&(q|=n.STENCIL_BUFFER_BIT)),Y){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,oe.__webglColorRenderbuffer[le]);const Te=i.get(g[le]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Te,0)}n.blitFramebuffer(0,0,z,W,0,0,z,W,q,n.NEAREST),l===!0&&(Dt.length=0,Ft.length=0,Dt.push(n.COLOR_ATTACHMENT0+le),w.depthBuffer&&w.resolveDepthBuffer===!1&&(Dt.push(ne),Ft.push(ne),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Ft)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Dt))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Y)for(let le=0;le<g.length;le++){t.bindFramebuffer(n.FRAMEBUFFER,oe.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+le,n.RENDERBUFFER,oe.__webglColorRenderbuffer[le]);const Te=i.get(g[le]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,oe.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+le,n.TEXTURE_2D,Te,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,oe.__webglMultisampledFramebuffer)}else if(w.depthBuffer&&w.resolveDepthBuffer===!1&&l){const g=w.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[g])}}}function Mt(w){return Math.min(s.maxSamples,w.samples)}function Pt(w){const g=i.get(w);return w.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&g.__useRenderToTexture!==!1}function U(w){const g=a.render.frame;u.get(w)!==g&&(u.set(w,g),w.update())}function ti(w,g){const z=w.colorSpace,W=w.format,q=w.type;return w.isCompressedTexture===!0||w.isVideoTexture===!0||z!==Cr&&z!==mn&&(qe.getTransfer(z)===nt?(W!==Ci||q!==pi)&&Ie("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Qe("WebGLTextures: Unsupported texture color space:",z)),g}function rt(w){return typeof HTMLImageElement<"u"&&w instanceof HTMLImageElement?(c.width=w.naturalWidth||w.width,c.height=w.naturalHeight||w.height):typeof VideoFrame<"u"&&w instanceof VideoFrame?(c.width=w.displayWidth,c.height=w.displayHeight):(c.width=w.width,c.height=w.height),c}this.allocateTextureUnit=k,this.resetTextureUnits=O,this.getTextureUnits=B,this.setTextureUnits=F,this.setTexture2D=Q,this.setTexture2DArray=te,this.setTexture3D=se,this.setTextureCube=pe,this.rebindTextures=tt,this.setupRenderTarget=Ke,this.updateRenderTargetMipmap=Ct,this.updateMultisampleRenderTarget=Ht,this.setupDepthRenderbuffer=lt,this.setupFrameBufferTexture=Pe,this.useMultisampledRTT=Pt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Yg(n,e){function t(i,s=mn){let r;const a=qe.getTransfer(s);if(i===pi)return n.UNSIGNED_BYTE;if(i===Ho)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Vo)return n.UNSIGNED_SHORT_5_5_5_1;if(i===qc)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Yc)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===Wc)return n.BYTE;if(i===Xc)return n.SHORT;if(i===Us)return n.UNSIGNED_SHORT;if(i===Go)return n.INT;if(i===Xi)return n.UNSIGNED_INT;if(i===Gi)return n.FLOAT;if(i===mi)return n.HALF_FLOAT;if(i===$c)return n.ALPHA;if(i===Zc)return n.RGB;if(i===Ci)return n.RGBA;if(i===rn)return n.DEPTH_COMPONENT;if(i===Ln)return n.DEPTH_STENCIL;if(i===Kc)return n.RED;if(i===Wo)return n.RED_INTEGER;if(i===In)return n.RG;if(i===Xo)return n.RG_INTEGER;if(i===qo)return n.RGBA_INTEGER;if(i===Sr||i===yr||i===br||i===Er)if(a===nt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Sr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===yr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Er)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Sr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===yr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===br)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Er)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Xa||i===qa||i===Ya||i===$a)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Xa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===qa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Ya)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===$a)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Za||i===Ka||i===Ja||i===Qa||i===ja||i===Ar||i===eo)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Za||i===Ka)return a===nt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Ja)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Qa)return r.COMPRESSED_R11_EAC;if(i===ja)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Ar)return r.COMPRESSED_RG11_EAC;if(i===eo)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===to||i===io||i===no||i===so||i===ro||i===ao||i===oo||i===lo||i===co||i===ho||i===uo||i===fo||i===po||i===mo)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===to)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===io)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===no)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===so)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===ro)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===ao)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===oo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===lo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===co)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===ho)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===uo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===fo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===po)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===mo)return a===nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===go||i===_o||i===xo)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===go)return a===nt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===_o)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===xo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===vo||i===Mo||i===Rr||i===So)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===vo)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Mo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Rr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===So)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Ns?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}const $g=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Zg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Kg{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new rh(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Kt({vertexShader:$g,fragmentShader:Zg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ke(new Un(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Jg extends Nn{constructor(e,t){super();const i=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,d=null,h=null,p=null,_=null;const v=typeof XRWebGLBinding<"u",m=new Kg,f={},T=t.getContextAttributes();let R=null,S=null;const E=[],b=[],P=new Ue;let x=null;const y=new Mi;y.viewport=new xt;const A=new Mi;A.viewport=new xt;const C=[y,A],L=new sd;let O=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let ae=E[K];return ae===void 0&&(ae=new sa,E[K]=ae),ae.getTargetRaySpace()},this.getControllerGrip=function(K){let ae=E[K];return ae===void 0&&(ae=new sa,E[K]=ae),ae.getGripSpace()},this.getHand=function(K){let ae=E[K];return ae===void 0&&(ae=new sa,E[K]=ae),ae.getHandSpace()};function F(K){const ae=b.indexOf(K.inputSource);if(ae===-1)return;const ie=E[ae];ie!==void 0&&(ie.update(K.inputSource,K.frame,c||a),ie.dispatchEvent({type:K.type,data:K.inputSource}))}function k(){s.removeEventListener("select",F),s.removeEventListener("selectstart",F),s.removeEventListener("selectend",F),s.removeEventListener("squeeze",F),s.removeEventListener("squeezestart",F),s.removeEventListener("squeezeend",F),s.removeEventListener("end",k),s.removeEventListener("inputsourceschange",V);for(let K=0;K<E.length;K++){const ae=b[K];ae!==null&&(b[K]=null,E[K].disconnect(ae))}O=null,B=null,m.reset();for(const K in f)delete f[K];e.setRenderTarget(R),p=null,h=null,d=null,s=null,S=null,et.stop(),i.isPresenting=!1,e.setPixelRatio(x),e.setSize(P.width,P.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,i.isPresenting===!0&&Ie("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,i.isPresenting===!0&&Ie("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return h!==null?h:p},this.getBinding=function(){return d===null&&v&&(d=new XRWebGLBinding(s,t)),d},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(R=e.getRenderTarget(),s.addEventListener("select",F),s.addEventListener("selectstart",F),s.addEventListener("selectend",F),s.addEventListener("squeeze",F),s.addEventListener("squeezestart",F),s.addEventListener("squeezeend",F),s.addEventListener("end",k),s.addEventListener("inputsourceschange",V),T.xrCompatible!==!0&&await t.makeXRCompatible(),x=e.getPixelRatio(),e.getSize(P),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let ie=null,Ne=null,Oe=null;T.depth&&(Oe=T.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ie=T.stencil?Ln:rn,Ne=T.stencil?Ns:Xi);const Pe={colorFormat:t.RGBA8,depthFormat:Oe,scaleFactor:r};d=this.getBinding(),h=d.createProjectionLayer(Pe),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),S=new oi(h.textureWidth,h.textureHeight,{format:Ci,type:pi,depthTexture:new os(h.textureWidth,h.textureHeight,Ne,void 0,void 0,void 0,void 0,void 0,void 0,ie),stencilBuffer:T.stencil,colorSpace:e.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{const ie={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,ie),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new oi(p.framebufferWidth,p.framebufferHeight,{format:Ci,type:pi,colorSpace:e.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),et.setContext(s),et.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function V(K){for(let ae=0;ae<K.removed.length;ae++){const ie=K.removed[ae],Ne=b.indexOf(ie);Ne>=0&&(b[Ne]=null,E[Ne].disconnect(ie))}for(let ae=0;ae<K.added.length;ae++){const ie=K.added[ae];let Ne=b.indexOf(ie);if(Ne===-1){for(let Pe=0;Pe<E.length;Pe++)if(Pe>=b.length){b.push(ie),Ne=Pe;break}else if(b[Pe]===null){b[Pe]=ie,Ne=Pe;break}if(Ne===-1)break}const Oe=E[Ne];Oe&&Oe.connect(ie)}}const Q=new I,te=new I;function se(K,ae,ie){Q.setFromMatrixPosition(ae.matrixWorld),te.setFromMatrixPosition(ie.matrixWorld);const Ne=Q.distanceTo(te),Oe=ae.projectionMatrix.elements,Pe=ie.projectionMatrix.elements,Tt=Oe[14]/(Oe[10]-1),Xe=Oe[14]/(Oe[10]+1),lt=(Oe[9]+1)/Oe[5],tt=(Oe[9]-1)/Oe[5],Ke=(Oe[8]-1)/Oe[0],Ct=(Pe[8]+1)/Pe[0],Dt=Tt*Ke,Ft=Tt*Ct,Ht=Ne/(-Ke+Ct),Mt=Ht*-Ke;if(ae.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(Mt),K.translateZ(Ht),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),Oe[10]===-1)K.projectionMatrix.copy(ae.projectionMatrix),K.projectionMatrixInverse.copy(ae.projectionMatrixInverse);else{const Pt=Tt+Ht,U=Xe+Ht,ti=Dt-Mt,rt=Ft+(Ne-Mt),w=lt*Xe/U*Pt,g=tt*Xe/U*Pt;K.projectionMatrix.makePerspective(ti,rt,w,g,Pt,U),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function pe(K,ae){ae===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(ae.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let ae=K.near,ie=K.far;m.texture!==null&&(m.depthNear>0&&(ae=m.depthNear),m.depthFar>0&&(ie=m.depthFar)),L.near=A.near=y.near=ae,L.far=A.far=y.far=ie,(O!==L.near||B!==L.far)&&(s.updateRenderState({depthNear:L.near,depthFar:L.far}),O=L.near,B=L.far),L.layers.mask=K.layers.mask|6,y.layers.mask=L.layers.mask&-5,A.layers.mask=L.layers.mask&-3;const Ne=K.parent,Oe=L.cameras;pe(L,Ne);for(let Pe=0;Pe<Oe.length;Pe++)pe(Oe[Pe],Ne);Oe.length===2?se(L,y,A):L.projectionMatrix.copy(y.projectionMatrix),ve(K,L,Ne)};function ve(K,ae,ie){ie===null?K.matrix.copy(ae.matrixWorld):(K.matrix.copy(ie.matrixWorld),K.matrix.invert(),K.matrix.multiply(ae.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(ae.projectionMatrix),K.projectionMatrixInverse.copy(ae.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=bo*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return L},this.getFoveation=function(){if(!(h===null&&p===null))return l},this.setFoveation=function(K){l=K,h!==null&&(h.fixedFoveation=K),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=K)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(L)},this.getCameraTexture=function(K){return f[K]};let je=null;function vt(K,ae){if(u=ae.getViewerPose(c||a),_=ae,u!==null){const ie=u.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let Ne=!1;ie.length!==L.cameras.length&&(L.cameras.length=0,Ne=!0);for(let Xe=0;Xe<ie.length;Xe++){const lt=ie[Xe];let tt=null;if(p!==null)tt=p.getViewport(lt);else{const Ct=d.getViewSubImage(h,lt);tt=Ct.viewport,Xe===0&&(e.setRenderTargetTextures(S,Ct.colorTexture,Ct.depthStencilTexture),e.setRenderTarget(S))}let Ke=C[Xe];Ke===void 0&&(Ke=new Mi,Ke.layers.enable(Xe),Ke.viewport=new xt,C[Xe]=Ke),Ke.matrix.fromArray(lt.transform.matrix),Ke.matrix.decompose(Ke.position,Ke.quaternion,Ke.scale),Ke.projectionMatrix.fromArray(lt.projectionMatrix),Ke.projectionMatrixInverse.copy(Ke.projectionMatrix).invert(),Ke.viewport.set(tt.x,tt.y,tt.width,tt.height),Xe===0&&(L.matrix.copy(Ke.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale)),Ne===!0&&L.cameras.push(Ke)}const Oe=s.enabledFeatures;if(Oe&&Oe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){d=i.getBinding();const Xe=d.getDepthInformation(ie[0]);Xe&&Xe.isValid&&Xe.texture&&m.init(Xe,s.renderState)}if(Oe&&Oe.includes("camera-access")&&v){e.state.unbindTexture(),d=i.getBinding();for(let Xe=0;Xe<ie.length;Xe++){const lt=ie[Xe].camera;if(lt){let tt=f[lt];tt||(tt=new rh,f[lt]=tt);const Ke=d.getCameraImage(lt);tt.sourceTexture=Ke}}}}for(let ie=0;ie<E.length;ie++){const Ne=b[ie],Oe=E[ie];Ne!==null&&Oe!==void 0&&Oe.update(Ne,ae,c||a)}je&&je(K,ae),ae.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ae}),_=null}const et=new hh;et.setAnimationLoop(vt),this.setAnimationLoop=function(K){je=K},this.dispose=function(){}}}const Qg=new gt,_h=new Fe;_h.set(-1,0,0,0,1,0,0,0,1);function jg(n,e){function t(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function i(m,f){f.color.getRGB(m.fogColor.value,ah(n)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function s(m,f,T,R,S){f.isNodeMaterial?f.uniformsNeedUpdate=!1:f.isMeshBasicMaterial?r(m,f):f.isMeshLambertMaterial?(r(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshToonMaterial?(r(m,f),d(m,f)):f.isMeshPhongMaterial?(r(m,f),u(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshStandardMaterial?(r(m,f),h(m,f),f.isMeshPhysicalMaterial&&p(m,f,S)):f.isMeshMatcapMaterial?(r(m,f),_(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),v(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(a(m,f),f.isLineDashedMaterial&&o(m,f)):f.isPointsMaterial?l(m,f,T,R):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,t(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===ai&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,t(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===ai&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,t(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,t(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);const T=e.get(f),R=T.envMap,S=T.envMapRotation;R&&(m.envMap.value=R,m.envMapRotation.value.setFromMatrix4(Qg.makeRotationFromEuler(S)).transpose(),R.isCubeTexture&&R.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(_h),m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,t(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,m.aoMapTransform))}function a(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform))}function o(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,T,R){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*T,m.scale.value=R*.5,f.map&&(m.map.value=f.map,t(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function u(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function d(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function h(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,T){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===ai&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=T.texture,m.transmissionSamplerSize.value.set(T.width,T.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,f){f.matcap&&(m.matcap.value=f.matcap)}function v(m,f){const T=e.get(f).light;m.referencePosition.value.setFromMatrixPosition(T.matrixWorld),m.nearDistance.value=T.shadow.camera.near,m.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function e0(n,e,t,i){let s={},r={},a=[];const o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(S,E){const b=E.program;i.uniformBlockBinding(S,b)}function c(S,E){let b=s[S.id];b===void 0&&(m(S),b=u(S),s[S.id]=b,S.addEventListener("dispose",T));const P=E.program;i.updateUBOMapping(S,P);const x=e.render.frame;r[S.id]!==x&&(h(S),r[S.id]=x)}function u(S){const E=d();S.__bindingPointIndex=E;const b=n.createBuffer(),P=S.__size,x=S.usage;return n.bindBuffer(n.UNIFORM_BUFFER,b),n.bufferData(n.UNIFORM_BUFFER,P,x),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,E,b),b}function d(){for(let S=0;S<o;S++)if(a.indexOf(S)===-1)return a.push(S),S;return Qe("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(S){const E=s[S.id],b=S.uniforms,P=S.__cache;n.bindBuffer(n.UNIFORM_BUFFER,E);for(let x=0,y=b.length;x<y;x++){const A=b[x];if(Array.isArray(A))for(let C=0,L=A.length;C<L;C++)p(A[C],x,C,P);else p(A,x,0,P)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function p(S,E,b,P){if(v(S,E,b,P)===!0){const x=S.__offset,y=S.value;if(Array.isArray(y)){let A=0;for(let C=0;C<y.length;C++){const L=y[C],O=f(L);_(L,S.__data,A),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(A+=O.storage/Float32Array.BYTES_PER_ELEMENT)}}else _(y,S.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,x,S.__data)}}function _(S,E,b){typeof S=="number"||typeof S=="boolean"?E[0]=S:S.isMatrix3?(E[0]=S.elements[0],E[1]=S.elements[1],E[2]=S.elements[2],E[3]=0,E[4]=S.elements[3],E[5]=S.elements[4],E[6]=S.elements[5],E[7]=0,E[8]=S.elements[6],E[9]=S.elements[7],E[10]=S.elements[8],E[11]=0):ArrayBuffer.isView(S)?E.set(new S.constructor(S.buffer,S.byteOffset,E.length)):S.toArray(E,b)}function v(S,E,b,P){const x=S.value,y=E+"_"+b;if(P[y]===void 0)return typeof x=="number"||typeof x=="boolean"?P[y]=x:ArrayBuffer.isView(x)?P[y]=x.slice():P[y]=x.clone(),!0;{const A=P[y];if(typeof x=="number"||typeof x=="boolean"){if(A!==x)return P[y]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(A.equals(x)===!1)return A.copy(x),!0}}return!1}function m(S){const E=S.uniforms;let b=0;const P=16;for(let y=0,A=E.length;y<A;y++){const C=Array.isArray(E[y])?E[y]:[E[y]];for(let L=0,O=C.length;L<O;L++){const B=C[L],F=Array.isArray(B.value)?B.value:[B.value];for(let k=0,V=F.length;k<V;k++){const Q=F[k],te=f(Q),se=b%P,pe=se%te.boundary,ve=se+pe;b+=pe,ve!==0&&P-ve<te.storage&&(b+=P-ve),B.__data=new Float32Array(te.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=b,b+=te.storage}}}const x=b%P;return x>0&&(b+=P-x),S.__size=b,S.__cache={},this}function f(S){const E={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(E.boundary=4,E.storage=4):S.isVector2?(E.boundary=8,E.storage=8):S.isVector3||S.isColor?(E.boundary=16,E.storage=12):S.isVector4?(E.boundary=16,E.storage=16):S.isMatrix3?(E.boundary=48,E.storage=48):S.isMatrix4?(E.boundary=64,E.storage=64):S.isTexture?Ie("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(S)?(E.boundary=16,E.storage=S.byteLength):Ie("WebGLRenderer: Unsupported uniform value type.",S),E}function T(S){const E=S.target;E.removeEventListener("dispose",T);const b=a.indexOf(E.__bindingPointIndex);a.splice(b,1),n.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function R(){for(const S in s)n.deleteBuffer(s[S]);a=[],s={},r={}}return{bind:l,update:c,dispose:R}}const t0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Oi=null;function i0(){return Oi===null&&(Oi=new Hu(t0,16,16,In,mi),Oi.name="DFG_LUT",Oi.minFilter=Zt,Oi.magFilter=Zt,Oi.wrapS=en,Oi.wrapT=en,Oi.generateMipmaps=!1,Oi.needsUpdate=!0),Oi}class n0{constructor(e={}){const{canvas:t=vu(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:h=!1,outputBufferType:p=pi}=e;this.isWebGLRenderer=!0;let _;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=i.getContextAttributes().alpha}else _=a;const v=p,m=new Set([qo,Xo,Wo]),f=new Set([pi,Xi,Us,Ns,Ho,Vo]),T=new Uint32Array(4),R=new Int32Array(4),S=new I;let E=null,b=null;const P=[],x=[];let y=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Li,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const A=this;let C=!1,L=null,O=null,B=null,F=null;this._outputColorSpace=vi;let k=0,V=0,Q=null,te=-1,se=null;const pe=new xt,ve=new xt;let je=null;const vt=new Ce(0);let et=0,K=t.width,ae=t.height,ie=1,Ne=null,Oe=null;const Pe=new xt(0,0,K,ae),Tt=new xt(0,0,K,ae);let Xe=!1;const lt=new Jo;let tt=!1,Ke=!1;const Ct=new gt,Dt=new I,Ft=new xt,Ht={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Mt=!1;function Pt(){return Q===null?ie:1}let U=i;function ti(M,N){return t.getContext(M,N)}try{const M={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Io}`),t.addEventListener("webglcontextlost",St,!1),t.addEventListener("webglcontextrestored",dt,!1),t.addEventListener("webglcontextcreationerror",Ii,!1),U===null){const N="webgl2";if(U=ti(N,M),U===null)throw ti(N)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(M){throw Qe("WebGLRenderer: "+M.message),M}let rt,w,g,z,W,q,ne,oe,Y,Z,le,Te,de,ce,Re,Le,ze,D,re,$,he,_e,j;function Ee(){rt=new im(U),rt.init(),he=new Yg(U,rt),w=new $p(U,rt,e,he),g=new Xg(U,rt),w.reversedDepthBuffer&&h&&g.buffers.depth.setReversed(!0),O=U.createFramebuffer(),B=U.createFramebuffer(),F=U.createFramebuffer(),z=new rm(U),W=new Lg,q=new qg(U,rt,g,W,w,he,z),ne=new tm(A),oe=new ld(U),_e=new qp(U,oe),Y=new nm(U,oe,z,_e),Z=new om(U,Y,oe,_e,z),D=new am(U,w,q),Re=new Zp(W),le=new Pg(A,ne,rt,w,_e,Re),Te=new jg(A,W),de=new Ig,ce=new Bg(rt),ze=new Xp(A,ne,g,Z,_,l),Le=new Wg(A,Z,w),j=new e0(U,z,w,g),re=new Yp(U,rt,z),$=new sm(U,rt,z),z.programs=le.programs,A.capabilities=w,A.extensions=rt,A.properties=W,A.renderLists=de,A.shadowMap=Le,A.state=g,A.info=z}Ee(),v!==pi&&(y=new cm(v,t.width,t.height,o,s,r));const Se=new Jg(A,U);this.xr=Se,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const M=rt.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){const M=rt.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return ie},this.setPixelRatio=function(M){M!==void 0&&(ie=M,this.setSize(K,ae,!1))},this.getSize=function(M){return M.set(K,ae)},this.setSize=function(M,N,X=!0){if(Se.isPresenting){Ie("WebGLRenderer: Can't change size while VR device is presenting.");return}K=M,ae=N,t.width=Math.floor(M*ie),t.height=Math.floor(N*ie),X===!0&&(t.style.width=M+"px",t.style.height=N+"px"),y!==null&&y.setSize(t.width,t.height),this.setViewport(0,0,M,N)},this.getDrawingBufferSize=function(M){return M.set(K*ie,ae*ie).floor()},this.setDrawingBufferSize=function(M,N,X){K=M,ae=N,ie=X,t.width=Math.floor(M*X),t.height=Math.floor(N*X),this.setViewport(0,0,M,N)},this.setEffects=function(M){if(v===pi){Qe("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let N=0;N<M.length;N++)if(M[N].isOutputPass===!0){Ie("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}y.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(pe)},this.getViewport=function(M){return M.copy(Pe)},this.setViewport=function(M,N,X,G){M.isVector4?Pe.set(M.x,M.y,M.z,M.w):Pe.set(M,N,X,G),g.viewport(pe.copy(Pe).multiplyScalar(ie).round())},this.getScissor=function(M){return M.copy(Tt)},this.setScissor=function(M,N,X,G){M.isVector4?Tt.set(M.x,M.y,M.z,M.w):Tt.set(M,N,X,G),g.scissor(ve.copy(Tt).multiplyScalar(ie).round())},this.getScissorTest=function(){return Xe},this.setScissorTest=function(M){g.setScissorTest(Xe=M)},this.setOpaqueSort=function(M){Ne=M},this.setTransparentSort=function(M){Oe=M},this.getClearColor=function(M){return M.copy(ze.getClearColor())},this.setClearColor=function(){ze.setClearColor(...arguments)},this.getClearAlpha=function(){return ze.getClearAlpha()},this.setClearAlpha=function(){ze.setClearAlpha(...arguments)},this.clear=function(M=!0,N=!0,X=!0){let G=0;if(M){let H=!1;if(Q!==null){const ge=Q.texture.format;H=m.has(ge)}if(H){const ge=Q.texture.type,Me=f.has(ge),me=ze.getClearColor(),ye=ze.getClearAlpha(),we=me.r,Be=me.g,He=me.b;Me?(T[0]=we,T[1]=Be,T[2]=He,T[3]=ye,U.clearBufferuiv(U.COLOR,0,T)):(R[0]=we,R[1]=Be,R[2]=He,R[3]=ye,U.clearBufferiv(U.COLOR,0,R))}else G|=U.COLOR_BUFFER_BIT}N&&(G|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),X&&(G|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&U.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),L=M},this.dispose=function(){t.removeEventListener("webglcontextlost",St,!1),t.removeEventListener("webglcontextrestored",dt,!1),t.removeEventListener("webglcontextcreationerror",Ii,!1),ze.dispose(),de.dispose(),ce.dispose(),W.dispose(),ne.dispose(),Z.dispose(),_e.dispose(),j.dispose(),le.dispose(),Se.dispose(),Se.removeEventListener("sessionstart",ul),Se.removeEventListener("sessionend",dl),yn.stop()};function St(M){M.preventDefault(),Al("WebGLRenderer: Context Lost."),C=!0}function dt(){Al("WebGLRenderer: Context Restored."),C=!1;const M=z.autoReset,N=Le.enabled,X=Le.autoUpdate,G=Le.needsUpdate,H=Le.type;Ee(),z.autoReset=M,Le.enabled=N,Le.autoUpdate=X,Le.needsUpdate=G,Le.type=H}function Ii(M){Qe("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Ui(M){const N=M.target;N.removeEventListener("dispose",Ui),Rh(N)}function Rh(M){Ch(M),W.remove(M)}function Ch(M){const N=W.get(M).programs;N!==void 0&&(N.forEach(function(X){le.releaseProgram(X)}),M.isShaderMaterial&&le.releaseShaderCache(M))}this.renderBufferDirect=function(M,N,X,G,H,ge){N===null&&(N=Ht);const Me=H.isMesh&&H.matrixWorld.determinantAffine()<0,me=Dh(M,N,X,G,H);g.setMaterial(G,Me);let ye=X.index,we=1;if(G.wireframe===!0){if(ye=Y.getWireframeAttribute(X),ye===void 0)return;we=2}const Be=X.drawRange,He=X.attributes.position;let Ae=Be.start*we,ot=(Be.start+Be.count)*we;ge!==null&&(Ae=Math.max(Ae,ge.start*we),ot=Math.min(ot,(ge.start+ge.count)*we)),ye!==null?(Ae=Math.max(Ae,0),ot=Math.min(ot,ye.count)):He!=null&&(Ae=Math.max(Ae,0),ot=Math.min(ot,He.count));const wt=ot-Ae;if(wt<0||wt===1/0)return;_e.setup(H,G,me,X,ye);let yt,ct=re;if(ye!==null&&(yt=oe.get(ye),ct=$,ct.setIndex(yt)),H.isMesh)G.wireframe===!0?(g.setLineWidth(G.wireframeLinewidth*Pt()),ct.setMode(U.LINES)):ct.setMode(U.TRIANGLES);else if(H.isLine){let qt=G.linewidth;qt===void 0&&(qt=1),g.setLineWidth(qt*Pt()),H.isLineSegments?ct.setMode(U.LINES):H.isLineLoop?ct.setMode(U.LINE_LOOP):ct.setMode(U.LINE_STRIP)}else H.isPoints?ct.setMode(U.POINTS):H.isSprite&&ct.setMode(U.TRIANGLES);if(H.isBatchedMesh)if(rt.get("WEBGL_multi_draw"))ct.renderMultiDraw(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount);else{const qt=H._multiDrawStarts,xe=H._multiDrawCounts,li=H._multiDrawCount,Je=ye?oe.get(ye).bytesPerElement:1,gi=W.get(G).currentProgram.getUniforms();for(let Ni=0;Ni<li;Ni++)gi.setValue(U,"_gl_DrawID",Ni),ct.render(qt[Ni]/Je,xe[Ni])}else if(H.isInstancedMesh)ct.renderInstances(Ae,wt,H.count);else if(X.isInstancedBufferGeometry){const qt=X._maxInstanceCount!==void 0?X._maxInstanceCount:1/0,xe=Math.min(X.instanceCount,qt);ct.renderInstances(Ae,wt,xe)}else ct.render(Ae,wt)};function hl(M,N,X){M.transparent===!0&&M.side===Bt&&M.forceSinglePass===!1?(M.side=ai,M.needsUpdate=!0,Ws(M,N,X),M.side=Mn,M.needsUpdate=!0,Ws(M,N,X),M.side=Bt):Ws(M,N,X)}this.compile=function(M,N,X=null){X===null&&(X=M),b=ce.get(X),b.init(N),x.push(b),X.traverseVisible(function(H){H.isLight&&H.layers.test(N.layers)&&(b.pushLight(H),H.castShadow&&b.pushShadow(H))}),M!==X&&M.traverseVisible(function(H){H.isLight&&H.layers.test(N.layers)&&(b.pushLight(H),H.castShadow&&b.pushShadow(H))}),b.setupLights();const G=new Set;return M.traverse(function(H){if(!(H.isMesh||H.isPoints||H.isLine||H.isSprite))return;const ge=H.material;if(ge)if(Array.isArray(ge))for(let Me=0;Me<ge.length;Me++){const me=ge[Me];hl(me,X,H),G.add(me)}else hl(ge,X,H),G.add(ge)}),b=x.pop(),G},this.compileAsync=function(M,N,X=null){const G=this.compile(M,N,X);return new Promise(H=>{function ge(){if(G.forEach(function(Me){W.get(Me).currentProgram.isReady()&&G.delete(Me)}),G.size===0){H(M);return}setTimeout(ge,10)}rt.get("KHR_parallel_shader_compile")!==null?ge():setTimeout(ge,10)})};let Xr=null;function Ph(M){Xr&&Xr(M)}function ul(){yn.stop()}function dl(){yn.start()}const yn=new hh;yn.setAnimationLoop(Ph),typeof self<"u"&&yn.setContext(self),this.setAnimationLoop=function(M){Xr=M,Se.setAnimationLoop(M),M===null?yn.stop():yn.start()},Se.addEventListener("sessionstart",ul),Se.addEventListener("sessionend",dl),this.render=function(M,N){if(N!==void 0&&N.isCamera!==!0){Qe("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;L!==null&&L.renderStart(M,N);const X=Se.enabled===!0&&Se.isPresenting===!0,G=y!==null&&(Q===null||X)&&y.begin(A,Q);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),Se.enabled===!0&&Se.isPresenting===!0&&(y===null||y.isCompositing()===!1)&&(Se.cameraAutoUpdate===!0&&Se.updateCamera(N),N=Se.getCamera()),M.isScene===!0&&M.onBeforeRender(A,M,N,Q),b=ce.get(M,x.length),b.init(N),b.state.textureUnits=q.getTextureUnits(),x.push(b),Ct.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),lt.setFromProjectionMatrix(Ct,Hi,N.reversedDepth),Ke=this.localClippingEnabled,tt=Re.init(this.clippingPlanes,Ke),E=de.get(M,P.length),E.init(),P.push(E),Se.enabled===!0&&Se.isPresenting===!0){const Me=A.xr.getDepthSensingMesh();Me!==null&&qr(Me,N,-1/0,A.sortObjects)}qr(M,N,0,A.sortObjects),E.finish(),A.sortObjects===!0&&E.sort(Ne,Oe,N.reversedDepth),Mt=Se.enabled===!1||Se.isPresenting===!1||Se.hasDepthSensing()===!1,Mt&&ze.addToRenderList(E,M),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),tt===!0&&Re.beginShadows();const H=b.state.shadowsArray;if(Le.render(H,M,N),tt===!0&&Re.endShadows(),(G&&y.hasRenderPass())===!1){const Me=E.opaque,me=E.transmissive;if(b.setupLights(),N.isArrayCamera){const ye=N.cameras;if(me.length>0)for(let we=0,Be=ye.length;we<Be;we++){const He=ye[we];pl(Me,me,M,He)}Mt&&ze.render(M);for(let we=0,Be=ye.length;we<Be;we++){const He=ye[we];fl(E,M,He,He.viewport)}}else me.length>0&&pl(Me,me,M,N),Mt&&ze.render(M),fl(E,M,N)}Q!==null&&V===0&&(q.updateMultisampleRenderTarget(Q),q.updateRenderTargetMipmap(Q)),G&&y.end(A),M.isScene===!0&&M.onAfterRender(A,M,N),_e.resetDefaultState(),te=-1,se=null,x.pop(),x.length>0?(b=x[x.length-1],q.setTextureUnits(b.state.textureUnits),tt===!0&&Re.setGlobalState(A.clippingPlanes,b.state.camera)):b=null,P.pop(),P.length>0?E=P[P.length-1]:E=null,L!==null&&L.renderEnd()};function qr(M,N,X,G){if(M.visible===!1)return;if(M.layers.test(N.layers)){if(M.isGroup)X=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(N);else if(M.isLightProbeGrid)b.pushLightProbeGrid(M);else if(M.isLight)b.pushLight(M),M.castShadow&&b.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||lt.intersectsSprite(M)){G&&Ft.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Ct);const Me=Z.update(M),me=M.material;me.visible&&E.push(M,Me,me,X,Ft.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||lt.intersectsObject(M))){const Me=Z.update(M),me=M.material;if(G&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Ft.copy(M.boundingSphere.center)):(Me.boundingSphere===null&&Me.computeBoundingSphere(),Ft.copy(Me.boundingSphere.center)),Ft.applyMatrix4(M.matrixWorld).applyMatrix4(Ct)),Array.isArray(me)){const ye=Me.groups;for(let we=0,Be=ye.length;we<Be;we++){const He=ye[we],Ae=me[He.materialIndex];Ae&&Ae.visible&&E.push(M,Me,Ae,X,Ft.z,He)}}else me.visible&&E.push(M,Me,me,X,Ft.z,null)}}const ge=M.children;for(let Me=0,me=ge.length;Me<me;Me++)qr(ge[Me],N,X,G)}function fl(M,N,X,G){const{opaque:H,transmissive:ge,transparent:Me}=M;b.setupLightsView(X),tt===!0&&Re.setGlobalState(A.clippingPlanes,X),G&&g.viewport(pe.copy(G)),H.length>0&&Vs(H,N,X),ge.length>0&&Vs(ge,N,X),Me.length>0&&Vs(Me,N,X),g.buffers.depth.setTest(!0),g.buffers.depth.setMask(!0),g.buffers.color.setMask(!0),g.setPolygonOffset(!1)}function pl(M,N,X,G){if((X.isScene===!0?X.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[G.id]===void 0){const Ae=rt.has("EXT_color_buffer_half_float")||rt.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[G.id]=new oi(1,1,{generateMipmaps:!0,type:Ae?mi:pi,minFilter:Pn,samples:Math.max(4,w.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:qe.workingColorSpace})}const ge=b.state.transmissionRenderTarget[G.id],Me=G.viewport||pe;ge.setSize(Me.z*A.transmissionResolutionScale,Me.w*A.transmissionResolutionScale);const me=A.getRenderTarget(),ye=A.getActiveCubeFace(),we=A.getActiveMipmapLevel();A.setRenderTarget(ge),A.getClearColor(vt),et=A.getClearAlpha(),et<1&&A.setClearColor(16777215,.5),A.clear(),Mt&&ze.render(X);const Be=A.toneMapping;A.toneMapping=Li;const He=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),b.setupLightsView(G),tt===!0&&Re.setGlobalState(A.clippingPlanes,G),Vs(M,X,G),q.updateMultisampleRenderTarget(ge),q.updateRenderTargetMipmap(ge),rt.has("WEBGL_multisampled_render_to_texture")===!1){let Ae=!1;for(let ot=0,wt=N.length;ot<wt;ot++){const yt=N[ot],{object:ct,geometry:qt,material:xe,group:li}=yt;if(xe.side===Bt&&ct.layers.test(G.layers)){const Je=xe.side;xe.side=ai,xe.needsUpdate=!0,ml(ct,X,G,qt,xe,li),xe.side=Je,xe.needsUpdate=!0,Ae=!0}}Ae===!0&&(q.updateMultisampleRenderTarget(ge),q.updateRenderTargetMipmap(ge))}A.setRenderTarget(me,ye,we),A.setClearColor(vt,et),He!==void 0&&(G.viewport=He),A.toneMapping=Be}function Vs(M,N,X){const G=N.isScene===!0?N.overrideMaterial:null;for(let H=0,ge=M.length;H<ge;H++){const Me=M[H],{object:me,geometry:ye,group:we}=Me;let Be=Me.material;Be.allowOverride===!0&&G!==null&&(Be=G),me.layers.test(X.layers)&&ml(me,N,X,ye,Be,we)}}function ml(M,N,X,G,H,ge){M.onBeforeRender(A,N,X,G,H,ge),M.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),H.onBeforeRender(A,N,X,G,M,ge),H.transparent===!0&&H.side===Bt&&H.forceSinglePass===!1?(H.side=ai,H.needsUpdate=!0,A.renderBufferDirect(X,N,G,H,M,ge),H.side=Mn,H.needsUpdate=!0,A.renderBufferDirect(X,N,G,H,M,ge),H.side=Bt):A.renderBufferDirect(X,N,G,H,M,ge),M.onAfterRender(A,N,X,G,H,ge)}function Ws(M,N,X){N.isScene!==!0&&(N=Ht);const G=W.get(M),H=b.state.lights,ge=b.state.shadowsArray,Me=H.state.version,me=le.getParameters(M,H.state,ge,N,X,b.state.lightProbeGridArray),ye=le.getProgramCacheKey(me);let we=G.programs;G.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?N.environment:null,G.fog=N.fog;const Be=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;G.envMap=ne.get(M.envMap||G.environment,Be),G.envMapRotation=G.environment!==null&&M.envMap===null?N.environmentRotation:M.envMapRotation,we===void 0&&(M.addEventListener("dispose",Ui),we=new Map,G.programs=we);let He=we.get(ye);if(He!==void 0){if(G.currentProgram===He&&G.lightsStateVersion===Me)return _l(M,me),He}else me.uniforms=le.getUniforms(M),L!==null&&M.isNodeMaterial&&L.build(M,X,me),M.onBeforeCompile(me,A),He=le.acquireProgram(me,ye),we.set(ye,He),G.uniforms=me.uniforms;const Ae=G.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Ae.clippingPlanes=Re.uniform),_l(M,me),G.needsLights=Uh(M),G.lightsStateVersion=Me,G.needsLights&&(Ae.ambientLightColor.value=H.state.ambient,Ae.lightProbe.value=H.state.probe,Ae.directionalLights.value=H.state.directional,Ae.directionalLightShadows.value=H.state.directionalShadow,Ae.spotLights.value=H.state.spot,Ae.spotLightShadows.value=H.state.spotShadow,Ae.rectAreaLights.value=H.state.rectArea,Ae.ltc_1.value=H.state.rectAreaLTC1,Ae.ltc_2.value=H.state.rectAreaLTC2,Ae.pointLights.value=H.state.point,Ae.pointLightShadows.value=H.state.pointShadow,Ae.hemisphereLights.value=H.state.hemi,Ae.directionalShadowMatrix.value=H.state.directionalShadowMatrix,Ae.spotLightMatrix.value=H.state.spotLightMatrix,Ae.spotLightMap.value=H.state.spotLightMap,Ae.pointShadowMatrix.value=H.state.pointShadowMatrix),G.lightProbeGrid=b.state.lightProbeGridArray.length>0,G.currentProgram=He,G.uniformsList=null,He}function gl(M){if(M.uniformsList===null){const N=M.currentProgram.getUniforms();M.uniformsList=Tr.seqWithValue(N.seq,M.uniforms)}return M.uniformsList}function _l(M,N){const X=W.get(M);X.outputColorSpace=N.outputColorSpace,X.batching=N.batching,X.batchingColor=N.batchingColor,X.instancing=N.instancing,X.instancingColor=N.instancingColor,X.instancingMorph=N.instancingMorph,X.skinning=N.skinning,X.morphTargets=N.morphTargets,X.morphNormals=N.morphNormals,X.morphColors=N.morphColors,X.morphTargetsCount=N.morphTargetsCount,X.numClippingPlanes=N.numClippingPlanes,X.numIntersection=N.numClipIntersection,X.vertexAlphas=N.vertexAlphas,X.vertexTangents=N.vertexTangents,X.toneMapping=N.toneMapping}function Lh(M,N){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;S.setFromMatrixPosition(N.matrixWorld);for(let X=0,G=M.length;X<G;X++){const H=M[X];if(H.texture!==null&&H.boundingBox.containsPoint(S))return H}return null}function Dh(M,N,X,G,H){N.isScene!==!0&&(N=Ht),q.resetTextureUnits();const ge=N.fog,Me=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?N.environment:null,me=Q===null?A.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:qe.workingColorSpace,ye=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,we=ne.get(G.envMap||Me,ye),Be=G.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,He=!!X.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Ae=!!X.morphAttributes.position,ot=!!X.morphAttributes.normal,wt=!!X.morphAttributes.color;let yt=Li;G.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(yt=A.toneMapping);const ct=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,qt=ct!==void 0?ct.length:0,xe=W.get(G),li=b.state.lights;if(tt===!0&&(Ke===!0||M!==se)){const ft=M===se&&G.id===te;Re.setState(G,M,ft)}let Je=!1;G.version===xe.__version?(xe.needsLights&&xe.lightsStateVersion!==li.state.version||xe.outputColorSpace!==me||H.isBatchedMesh&&xe.batching===!1||!H.isBatchedMesh&&xe.batching===!0||H.isBatchedMesh&&xe.batchingColor===!0&&H.colorTexture===null||H.isBatchedMesh&&xe.batchingColor===!1&&H.colorTexture!==null||H.isInstancedMesh&&xe.instancing===!1||!H.isInstancedMesh&&xe.instancing===!0||H.isSkinnedMesh&&xe.skinning===!1||!H.isSkinnedMesh&&xe.skinning===!0||H.isInstancedMesh&&xe.instancingColor===!0&&H.instanceColor===null||H.isInstancedMesh&&xe.instancingColor===!1&&H.instanceColor!==null||H.isInstancedMesh&&xe.instancingMorph===!0&&H.morphTexture===null||H.isInstancedMesh&&xe.instancingMorph===!1&&H.morphTexture!==null||xe.envMap!==we||G.fog===!0&&xe.fog!==ge||xe.numClippingPlanes!==void 0&&(xe.numClippingPlanes!==Re.numPlanes||xe.numIntersection!==Re.numIntersection)||xe.vertexAlphas!==Be||xe.vertexTangents!==He||xe.morphTargets!==Ae||xe.morphNormals!==ot||xe.morphColors!==wt||xe.toneMapping!==yt||xe.morphTargetsCount!==qt||!!xe.lightProbeGrid!=b.state.lightProbeGridArray.length>0)&&(Je=!0):(Je=!0,xe.__version=G.version);let gi=xe.currentProgram;Je===!0&&(gi=Ws(G,N,H),L&&G.isNodeMaterial&&L.onUpdateProgram(G,gi,xe));let Ni=!1,an=!1,On=!1;const ht=gi.getUniforms(),At=xe.uniforms;if(g.useProgram(gi.program)&&(Ni=!0,an=!0,On=!0),G.id!==te&&(te=G.id,an=!0),xe.needsLights){const ft=Lh(b.state.lightProbeGridArray,H);xe.lightProbeGrid!==ft&&(xe.lightProbeGrid=ft,an=!0)}if(Ni||se!==M){g.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),ht.setValue(U,"projectionMatrix",M.projectionMatrix),ht.setValue(U,"viewMatrix",M.matrixWorldInverse);const ln=ht.map.cameraPosition;ln!==void 0&&ln.setValue(U,Dt.setFromMatrixPosition(M.matrixWorld)),w.logarithmicDepthBuffer&&ht.setValue(U,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&ht.setValue(U,"isOrthographic",M.isOrthographicCamera===!0),se!==M&&(se=M,an=!0,On=!0)}if(xe.needsLights&&(li.state.directionalShadowMap.length>0&&ht.setValue(U,"directionalShadowMap",li.state.directionalShadowMap,q),li.state.spotShadowMap.length>0&&ht.setValue(U,"spotShadowMap",li.state.spotShadowMap,q),li.state.pointShadowMap.length>0&&ht.setValue(U,"pointShadowMap",li.state.pointShadowMap,q)),H.isSkinnedMesh){ht.setOptional(U,H,"bindMatrix"),ht.setOptional(U,H,"bindMatrixInverse");const ft=H.skeleton;ft&&(ft.boneTexture===null&&ft.computeBoneTexture(),ht.setValue(U,"boneTexture",ft.boneTexture,q))}H.isBatchedMesh&&(ht.setOptional(U,H,"batchingTexture"),ht.setValue(U,"batchingTexture",H._matricesTexture,q),ht.setOptional(U,H,"batchingIdTexture"),ht.setValue(U,"batchingIdTexture",H._indirectTexture,q),ht.setOptional(U,H,"batchingColorTexture"),H._colorsTexture!==null&&ht.setValue(U,"batchingColorTexture",H._colorsTexture,q));const on=X.morphAttributes;if((on.position!==void 0||on.normal!==void 0||on.color!==void 0)&&D.update(H,X,gi),(an||xe.receiveShadow!==H.receiveShadow)&&(xe.receiveShadow=H.receiveShadow,ht.setValue(U,"receiveShadow",H.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&N.environment!==null&&(At.envMapIntensity.value=N.environmentIntensity),At.dfgLUT!==void 0&&(At.dfgLUT.value=i0()),an){if(ht.setValue(U,"toneMappingExposure",A.toneMappingExposure),xe.needsLights&&Ih(At,On),ge&&G.fog===!0&&Te.refreshFogUniforms(At,ge),Te.refreshMaterialUniforms(At,G,ie,ae,b.state.transmissionRenderTarget[M.id]),xe.needsLights&&xe.lightProbeGrid){const ft=xe.lightProbeGrid;At.probesSH.value=ft.texture,At.probesMin.value.copy(ft.boundingBox.min),At.probesMax.value.copy(ft.boundingBox.max),At.probesResolution.value.copy(ft.resolution)}Tr.upload(U,gl(xe),At,q)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Tr.upload(U,gl(xe),At,q),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&ht.setValue(U,"center",H.center),ht.setValue(U,"modelViewMatrix",H.modelViewMatrix),ht.setValue(U,"normalMatrix",H.normalMatrix),ht.setValue(U,"modelMatrix",H.matrixWorld),G.uniformsGroups!==void 0){const ft=G.uniformsGroups;for(let ln=0,zn=ft.length;ln<zn;ln++){const xl=ft[ln];j.update(xl,gi),j.bind(xl,gi)}}return gi}function Ih(M,N){M.ambientLightColor.needsUpdate=N,M.lightProbe.needsUpdate=N,M.directionalLights.needsUpdate=N,M.directionalLightShadows.needsUpdate=N,M.pointLights.needsUpdate=N,M.pointLightShadows.needsUpdate=N,M.spotLights.needsUpdate=N,M.spotLightShadows.needsUpdate=N,M.rectAreaLights.needsUpdate=N,M.hemisphereLights.needsUpdate=N}function Uh(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return k},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return Q},this.setRenderTargetTextures=function(M,N,X){const G=W.get(M);G.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),W.get(M.texture).__webglTexture=N,W.get(M.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:X,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,N){const X=W.get(M);X.__webglFramebuffer=N,X.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(M,N=0,X=0){Q=M,k=N,V=X;let G=null,H=!1,ge=!1;if(M){const me=W.get(M);if(me.__useDefaultFramebuffer!==void 0){g.bindFramebuffer(U.FRAMEBUFFER,me.__webglFramebuffer),pe.copy(M.viewport),ve.copy(M.scissor),je=M.scissorTest,g.viewport(pe),g.scissor(ve),g.setScissorTest(je),te=-1;return}else if(me.__webglFramebuffer===void 0)q.setupRenderTarget(M);else if(me.__hasExternalTextures)q.rebindTextures(M,W.get(M.texture).__webglTexture,W.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){const Be=M.depthTexture;if(me.__boundDepthTexture!==Be){if(Be!==null&&W.has(Be)&&(M.width!==Be.image.width||M.height!==Be.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");q.setupDepthRenderbuffer(M)}}const ye=M.texture;(ye.isData3DTexture||ye.isDataArrayTexture||ye.isCompressedArrayTexture)&&(ge=!0);const we=W.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(we[N])?G=we[N][X]:G=we[N],H=!0):M.samples>0&&q.useMultisampledRTT(M)===!1?G=W.get(M).__webglMultisampledFramebuffer:Array.isArray(we)?G=we[X]:G=we,pe.copy(M.viewport),ve.copy(M.scissor),je=M.scissorTest}else pe.copy(Pe).multiplyScalar(ie).floor(),ve.copy(Tt).multiplyScalar(ie).floor(),je=Xe;if(X!==0&&(G=O),g.bindFramebuffer(U.FRAMEBUFFER,G)&&g.drawBuffers(M,G),g.viewport(pe),g.scissor(ve),g.setScissorTest(je),H){const me=W.get(M.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+N,me.__webglTexture,X)}else if(ge){const me=N;for(let ye=0;ye<M.textures.length;ye++){const we=W.get(M.textures[ye]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+ye,we.__webglTexture,X,me)}}else if(M!==null&&X!==0){const me=W.get(M.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,me.__webglTexture,X)}te=-1},this.readRenderTargetPixels=function(M,N,X,G,H,ge,Me,me=0){if(!(M&&M.isWebGLRenderTarget)){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ye=W.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Me!==void 0&&(ye=ye[Me]),ye){g.bindFramebuffer(U.FRAMEBUFFER,ye);try{const we=M.textures[me],Be=we.format,He=we.type;if(M.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+me),!w.textureFormatReadable(Be)){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!w.textureTypeReadable(He)){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=M.width-G&&X>=0&&X<=M.height-H&&U.readPixels(N,X,G,H,he.convert(Be),he.convert(He),ge)}finally{const we=Q!==null?W.get(Q).__webglFramebuffer:null;g.bindFramebuffer(U.FRAMEBUFFER,we)}}},this.readRenderTargetPixelsAsync=async function(M,N,X,G,H,ge,Me,me=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ye=W.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Me!==void 0&&(ye=ye[Me]),ye)if(N>=0&&N<=M.width-G&&X>=0&&X<=M.height-H){g.bindFramebuffer(U.FRAMEBUFFER,ye);const we=M.textures[me],Be=we.format,He=we.type;if(M.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+me),!w.textureFormatReadable(Be))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!w.textureTypeReadable(He))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Ae=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,Ae),U.bufferData(U.PIXEL_PACK_BUFFER,ge.byteLength,U.STREAM_READ),U.readPixels(N,X,G,H,he.convert(Be),he.convert(He),0);const ot=Q!==null?W.get(Q).__webglFramebuffer:null;g.bindFramebuffer(U.FRAMEBUFFER,ot);const wt=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Mu(U,wt,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,Ae),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,ge),U.deleteBuffer(Ae),U.deleteSync(wt),ge}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,N=null,X=0){const G=Math.pow(2,-X),H=Math.floor(M.image.width*G),ge=Math.floor(M.image.height*G),Me=N!==null?N.x:0,me=N!==null?N.y:0;q.setTexture2D(M,0),U.copyTexSubImage2D(U.TEXTURE_2D,X,0,0,Me,me,H,ge),g.unbindTexture()},this.copyTextureToTexture=function(M,N,X=null,G=null,H=0,ge=0){let Me,me,ye,we,Be,He,Ae,ot,wt;const yt=M.isCompressedTexture?M.mipmaps[ge]:M.image;if(X!==null)Me=X.max.x-X.min.x,me=X.max.y-X.min.y,ye=X.isBox3?X.max.z-X.min.z:1,we=X.min.x,Be=X.min.y,He=X.isBox3?X.min.z:0;else{const At=Math.pow(2,-H);Me=Math.floor(yt.width*At),me=Math.floor(yt.height*At),M.isDataArrayTexture?ye=yt.depth:M.isData3DTexture?ye=Math.floor(yt.depth*At):ye=1,we=0,Be=0,He=0}G!==null?(Ae=G.x,ot=G.y,wt=G.z):(Ae=0,ot=0,wt=0);const ct=he.convert(N.format),qt=he.convert(N.type);let xe;N.isData3DTexture?(q.setTexture3D(N,0),xe=U.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(q.setTexture2DArray(N,0),xe=U.TEXTURE_2D_ARRAY):(q.setTexture2D(N,0),xe=U.TEXTURE_2D),g.activeTexture(U.TEXTURE0),g.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,N.flipY),g.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),g.pixelStorei(U.UNPACK_ALIGNMENT,N.unpackAlignment);const li=g.getParameter(U.UNPACK_ROW_LENGTH),Je=g.getParameter(U.UNPACK_IMAGE_HEIGHT),gi=g.getParameter(U.UNPACK_SKIP_PIXELS),Ni=g.getParameter(U.UNPACK_SKIP_ROWS),an=g.getParameter(U.UNPACK_SKIP_IMAGES);g.pixelStorei(U.UNPACK_ROW_LENGTH,yt.width),g.pixelStorei(U.UNPACK_IMAGE_HEIGHT,yt.height),g.pixelStorei(U.UNPACK_SKIP_PIXELS,we),g.pixelStorei(U.UNPACK_SKIP_ROWS,Be),g.pixelStorei(U.UNPACK_SKIP_IMAGES,He);const On=M.isDataArrayTexture||M.isData3DTexture,ht=N.isDataArrayTexture||N.isData3DTexture;if(M.isDepthTexture){const At=W.get(M),on=W.get(N),ft=W.get(At.__renderTarget),ln=W.get(on.__renderTarget);g.bindFramebuffer(U.READ_FRAMEBUFFER,ft.__webglFramebuffer),g.bindFramebuffer(U.DRAW_FRAMEBUFFER,ln.__webglFramebuffer);for(let zn=0;zn<ye;zn++)On&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,W.get(M).__webglTexture,H,He+zn),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,W.get(N).__webglTexture,ge,wt+zn)),U.blitFramebuffer(we,Be,Me,me,Ae,ot,Me,me,U.DEPTH_BUFFER_BIT,U.NEAREST);g.bindFramebuffer(U.READ_FRAMEBUFFER,null),g.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(H!==0||M.isRenderTargetTexture||W.has(M)){const At=W.get(M),on=W.get(N);g.bindFramebuffer(U.READ_FRAMEBUFFER,B),g.bindFramebuffer(U.DRAW_FRAMEBUFFER,F);for(let ft=0;ft<ye;ft++)On?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,At.__webglTexture,H,He+ft):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,At.__webglTexture,H),ht?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,on.__webglTexture,ge,wt+ft):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,on.__webglTexture,ge),H!==0?U.blitFramebuffer(we,Be,Me,me,Ae,ot,Me,me,U.COLOR_BUFFER_BIT,U.NEAREST):ht?U.copyTexSubImage3D(xe,ge,Ae,ot,wt+ft,we,Be,Me,me):U.copyTexSubImage2D(xe,ge,Ae,ot,we,Be,Me,me);g.bindFramebuffer(U.READ_FRAMEBUFFER,null),g.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else ht?M.isDataTexture||M.isData3DTexture?U.texSubImage3D(xe,ge,Ae,ot,wt,Me,me,ye,ct,qt,yt.data):N.isCompressedArrayTexture?U.compressedTexSubImage3D(xe,ge,Ae,ot,wt,Me,me,ye,ct,yt.data):U.texSubImage3D(xe,ge,Ae,ot,wt,Me,me,ye,ct,qt,yt):M.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,ge,Ae,ot,Me,me,ct,qt,yt.data):M.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,ge,Ae,ot,yt.width,yt.height,ct,yt.data):U.texSubImage2D(U.TEXTURE_2D,ge,Ae,ot,Me,me,ct,qt,yt);g.pixelStorei(U.UNPACK_ROW_LENGTH,li),g.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Je),g.pixelStorei(U.UNPACK_SKIP_PIXELS,gi),g.pixelStorei(U.UNPACK_SKIP_ROWS,Ni),g.pixelStorei(U.UNPACK_SKIP_IMAGES,an),ge===0&&N.generateMipmaps&&U.generateMipmap(xe),g.unbindTexture()},this.initRenderTarget=function(M){W.get(M).__webglFramebuffer===void 0&&q.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?q.setTextureCube(M,0):M.isData3DTexture?q.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?q.setTexture2DArray(M,0):q.setTexture2D(M,0),g.unbindTexture()},this.resetState=function(){k=0,V=0,Q=null,g.reset(),_e.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Hi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=qe._getUnpackColorSpace()}}const wr={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class ms{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const s0=new Hs(-1,1,1,-1,0,1);class r0 extends st{constructor(){super(),this.setAttribute("position",new at([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new at([0,2,0,0,2,0],2))}}const a0=new r0;class el{constructor(e){this._mesh=new ke(a0,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,s0)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class o0 extends ms{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Kt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Os.clone(e.uniforms),this.material=new Kt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new el(this.material)}render(e,t,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class Tc extends ms{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,i){const s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}}class l0 extends ms{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class c0{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const i=e.getSize(new Ue);this._width=i.width,this._height=i.height,t=new oi(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:mi}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new o0(wr),this.copyPass.material.blending=Vi,this.timer=new rd}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());const t=this.renderer.getRenderTarget();let i=!1;for(let s=0,r=this.passes.length;s<r;s++){const a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),a.needsSwap){if(i){const o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}Tc!==void 0&&(a instanceof Tc?i=!0:a instanceof l0&&(i=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new Ue);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const i=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(i,s),this.renderTarget2.setSize(i,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(i,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class h0 extends ms{constructor(e,t,i=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=i,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new Ce}render(e,t,i){const s=e.autoClear;e.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=s}}const u0={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Ce(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class hs extends ms{constructor(e,t=1,i,s){super(),this.strength=t,this.radius=i,this.threshold=s,this.resolution=e!==void 0?new Ue(e.x,e.y):new Ue(256,256),this.clearColor=new Ce(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new oi(r,a,{type:mi}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){const d=new oi(r,a,{type:mi});d.texture.name="UnrealBloomPass.h"+u,d.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(d);const h=new oi(r,a,{type:mi});h.texture.name="UnrealBloomPass.v"+u,h.texture.generateMipmaps=!1,this.renderTargetsVertical.push(h),r=Math.round(r/2),a=Math.round(a/2)}const o=u0;this.highPassUniforms=Os.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Kt({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new Ue(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new I(1,1,1),new I(1,1,1),new I(1,1,1),new I(1,1,1),new I(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Os.clone(wr.uniforms),this.blendMaterial=new Kt({uniforms:this.copyUniforms,vertexShader:wr.vertexShader,fragmentShader:wr.fragmentShader,premultipliedAlpha:!0,blending:_t,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Ce,this._oldClearAlpha=1,this._basic=new mt,this._fsQuad=new el(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let i=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(i,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(i,s),this.renderTargetsVertical[r].setSize(i,s),this.separableBlurMaterials[r].uniforms.invSize.value=new Ue(1/i,1/s),i=Math.round(i/2),s=Math.round(s/2)}render(e,t,i,s,r){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();const a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=hs.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=hs.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){const t=[],i=e/3;for(let s=0;s<e;s++)t.push(.39894*Math.exp(-.5*s*s/(i*i))/i);return new Kt({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new Ue(.5,.5)},direction:{value:new Ue(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new Kt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}hs.BlurDirectionX=new Ue(1,0);hs.BlurDirectionY=new Ue(0,1);const _r={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class d0 extends ms{constructor(){super(),this.isOutputPass=!0,this.uniforms=Os.clone(_r.uniforms),this.material=new oh({name:_r.name,uniforms:this.uniforms,vertexShader:_r.vertexShader,fragmentShader:_r.fragmentShader}),this._fsQuad=new el(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},qe.getTransfer(this._outputColorSpace)===nt&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Uo?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===No?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Fo?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Oo?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Bo?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===ko?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===zo&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class f0{constructor(e,t={}){this.camera=e,this.basePosition=e.position.clone(),this.reducedMotion=!!t.reducedMotion,this.timeScale=It.normal,this.targetScale=It.normal,this.hitStopRemaining=0,this.paused=!1,this.shakeAmplitude=0,this.shakePhase=Math.random()*100,this.zoom=1,this.elapsed=0,this.realElapsed=0,this._lastAppliedZoom=1}setBulletTime(e){this.targetScale=e?It.bullet:It.normal}setTimeScale(e){this.targetScale=e}get inBulletTime(){return this.targetScale<It.normal-.001}hitStop(e=It.hitStop){this.hitStopRemaining=Math.max(this.hitStopRemaining,e)}pause(){this.paused=!0}resume(){this.paused=!1}get frozen(){return this.paused||this.hitStopRemaining>0}shake(e){if(this.reducedMotion)return;const t=Math.min(e*jt.shake.scale,jt.shake.max);this.shakeAmplitude=Math.min(this.shakeAmplitude+t,jt.shake.max)}zoomPunch(e=jt.zoomPunch){this.reducedMotion||(this.zoom=Math.min(this.zoom+e,1+jt.zoomPunch*3))}_updateFeel(e){let t=0,i=0;if(this.shakeAmplitude>5e-4){this.shakePhase+=e*jt.shake.frequency,this.shakeAmplitude*=Math.exp(-7.5*e);const s=this.shakeAmplitude;t=Math.sin(this.shakePhase*1)*s,i=Math.cos(this.shakePhase*1.37+1.1)*s}else this.shakeAmplitude=0;this.camera.position.set(this.basePosition.x+t,this.basePosition.y,this.basePosition.z+i),Math.abs(this.zoom-1)>4e-4?this.zoom+=(1-this.zoom)*(1-Math.exp(-6*e)):this.zoom=1,Math.abs(this.zoom-this._lastAppliedZoom)>2e-4&&(this.camera.zoom=this.zoom,this.camera.updateProjectionMatrix(),this._lastAppliedZoom=this.zoom)}update(e){const t=Math.min(Math.max(e,0),It.maxFrameDt);if(this.realElapsed+=t,this._updateFeel(t),this.paused)return{dt:0,rawDt:t,frozen:!0};if(this.hitStopRemaining>0)return this.hitStopRemaining-=t,{dt:0,rawDt:t,frozen:!0};if(this.timeScale!==this.targetScale){const s=this.targetScale<this.timeScale?It.dilateIn:It.dilateOut,r=1-Math.exp(-t/Math.max(s,1e-4));this.timeScale+=(this.targetScale-this.timeScale)*r,Math.abs(this.timeScale-this.targetScale)<.003&&(this.timeScale=this.targetScale)}const i=t*this.timeScale;return this.elapsed+=i,{dt:i,rawDt:t,frozen:!1}}}const Qi={IDLE:"idle",AIMING:"aiming"};class p0{constructor(e,t={}){this.element=e,this.handlers=t,this.camera=t.camera||null,this.state=Qi.IDLE,this.pointerId=null,this.startX=0,this.startY=0,this.currentX=0,this.currentY=0,this.startTime=0,this.holdTime=0,this._lastTapTime=-1/0,this._lastTapX=0,this._lastTapY=0,this._dirX=0,this._dirZ=-1,this._targetX=0,this._targetZ=-1,this._lastAimTime=0,this._hasHeading=!0,this._lastBearing=null,this._lastTapTime=-1/0,this._lastTapX=0,this._lastTapY=0,this.aim=this._makeAim(),this._world={x:0,z:0},this._onDown=this._handleDown.bind(this),this._onMove=this._handleMove.bind(this),this._onUp=this._handleUp.bind(this),this._onCancel=this._handleCancel.bind(this),this._onContext=i=>i.preventDefault(),e.addEventListener("pointerdown",this._onDown,{passive:!1}),e.addEventListener("pointermove",this._onMove,{passive:!1}),e.addEventListener("pointerup",this._onUp,{passive:!1}),e.addEventListener("pointercancel",this._onCancel,{passive:!1}),e.addEventListener("lostpointercapture",this._onCancel,{passive:!1}),e.addEventListener("contextmenu",this._onContext),e.addEventListener("touchmove",i=>i.preventDefault(),{passive:!1})}dispose(){const e=this.element;e.removeEventListener("pointerdown",this._onDown),e.removeEventListener("pointermove",this._onMove),e.removeEventListener("pointerup",this._onUp),e.removeEventListener("pointercancel",this._onCancel),e.removeEventListener("lostpointercapture",this._onCancel),e.removeEventListener("contextmenu",this._onContext)}_makeAim(){return{dirX:0,dirZ:-1,pullX:0,pullZ:0,power:0,pullLength:0,distPx:0,worldX:0,worldZ:0,hold:0,valid:!1}}get enabled(){return this.handlers.isEnabled?this.handlers.isEnabled():!0}get isAiming(){return this.state===Qi.AIMING}screenToWorld(e,t,i={x:0,z:0}){const s=this.element.getBoundingClientRect(),r=s.width>0?(e-s.left)/s.width*2-1:0,a=s.height>0?(t-s.top)/s.height*2-1:0,o=this.camera&&this.camera.zoom||1,l=_n.viewHeight/o,c=l*De.aspect;return i.x=r*(c/2),i.z=a*(l/2),i}_anchor(){return this.handlers.getAnchor?.()||{x:0,z:0}}setHeading(e,t){const i=Math.hypot(e,t);i<1e-6||(this._dirX=e/i,this._dirZ=t/i)}get heading(){return{x:this._dirX,z:this._dirZ}}_cue(){const e=this._anchor(),t=this.screenToWorld(this.currentX,this.currentY,this._world),i=e.x-t.x,s=e.z-t.z;return{finger:t,draw:Math.hypot(i,s),vx:i,vz:s}}_updateAim(e){const t=this.aim,i=Math.max(0,(e-this._lastAimTime)/1e3),s=this._cue();if(s.draw>qi.minAimRadius){const c=1/s.draw;this._targetX=s.vx*c,this._targetZ=s.vz*c}const r=1-Math.exp(-i/qi.aimSmoothing);this._dirX+=(this._targetX-this._dirX)*r,this._dirZ+=(this._targetZ-this._dirZ)*r;const a=Math.hypot(this._dirX,this._dirZ)||1;this._dirX/=a,this._dirZ/=a,this._lastAimTime=e;const o=Math.max(qi.maxDraw-qi.minDraw,1e-4),l=Math.min(Math.max((s.draw-qi.minDraw)/o,0),1);return t.power=be.minPower+(1-be.minPower)*l,t.charge=l,t.hold=(e-this.startTime)/1e3,t.distPx=Math.hypot(this.currentX-this.startX,this.currentY-this.startY),t.dirX=this._dirX,t.dirZ=this._dirZ,t.pullLength=s.draw,t.cueX=s.finger.x,t.cueZ=s.finger.z,t.pullX=0,t.pullZ=0,t.valid=!0,t.worldX=s.finger.x,t.worldZ=s.finger.z,t}_handleDown(e){if(this.pointerId!==null||!this.enabled)return;if(e.preventDefault(),this.pointerId=e.pointerId,this.element.setPointerCapture)try{this.element.setPointerCapture(e.pointerId)}catch{}this.startX=this.currentX=e.clientX,this.startY=this.currentY=e.clientY,this.startTime=performance.now(),this.holdTime=0,this.state=Qi.AIMING,this._lastAimTime=this.startTime;const t=this._cue();if(t.draw>qi.minAimRadius){const i=1/t.draw;this._dirX=this._targetX=t.vx*i,this._dirZ=this._targetZ=t.vz*i}else this._targetX=this._dirX,this._targetZ=this._dirZ;this._updateAim(this.startTime),this.handlers.onAimStart?.(this.aim),this.handlers.onAimUpdate?.(this.aim)}_handleMove(e){if(e.pointerId!==this.pointerId)return;e.preventDefault(),this.currentX=e.clientX,this.currentY=e.clientY;const t=this._updateAim(performance.now());this.state===Qi.AIMING&&this.handlers.onAimUpdate?.(t)}_handleUp(e){if(e.pointerId!==this.pointerId)return;e.preventDefault(),this.currentX=e.clientX,this.currentY=e.clientY;const t=performance.now(),i=this._updateAim(t);if(this._release(e.pointerId),Math.hypot(this.currentX-this.startX,this.currentY-this.startY)<=qi.tapMaxTravelPx){const a=t-this._lastTapTime,o=Math.hypot(this.currentX-this._lastTapX,this.currentY-this._lastTapY);if(a<=qi.doubleTapMs&&o<=qi.doubleTapMaxTravelPx){this._lastTapTime=-1/0,this.handlers.onFlick?.(i);return}this._lastTapTime=t,this._lastTapX=this.currentX,this._lastTapY=this.currentY}else this._lastTapTime=-1/0;i.valid?this.handlers.onRelease?.(i):this.handlers.onAimCancel?.()}_handleCancel(e){e.pointerId===this.pointerId&&(this._release(e.pointerId),this.handlers.onAimCancel?.())}_release(e){if(this.element.releasePointerCapture&&this.element.hasPointerCapture?.(e))try{this.element.releasePointerCapture(e)}catch{}this.pointerId=null,this.state=Qi.IDLE,this.holdTime=0}cancel(){this.pointerId===null&&this.state===Qi.IDLE||(this.pointerId!==null&&this._release(this.pointerId),this.state=Qi.IDLE,this.handlers.onAimCancel?.())}update(e){this.state!==Qi.IDLE&&(this.holdTime+=e,this.aim.hold=this.holdTime)}refresh(){if(this.state===Qi.IDLE||this.pointerId===null)return null;const e=this._updateAim(performance.now());return e.hold=this.holdTime,e}}class m0{constructor(){this.ctx=null,this.master=null,this.filter=null,this.noiseBuffer=null,this.enabled=!0,this.unlocked=!1,this._dilation=1,this._lastImpactAt=-1,this._onVisibility=()=>{this.ctx&&(document.hidden?this.ctx.suspend?.():this.ctx.resume?.())},document.addEventListener("visibilitychange",this._onVisibility)}unlock(){if(this.unlocked)return this.ctx?.resume?.(),!0;const e=window.AudioContext||window.webkitAudioContext;return e?(this.ctx=new e,this.filter=this.ctx.createBiquadFilter(),this.filter.type="lowpass",this.filter.frequency.value=bt.filterOpen,this.filter.Q.value=.9,this.master=this.ctx.createGain(),this.master.gain.value=bt.masterGain,this.filter.connect(this.master),this.master.connect(this.ctx.destination),this.noiseBuffer=this._buildNoise(1.2),this.unlocked=!0,this.ctx.resume?.(),!0):(this.enabled=!1,!1)}dispose(){document.removeEventListener("visibilitychange",this._onVisibility),this.ctx?.close?.(),this.ctx=null,this.unlocked=!1}get ready(){return this.enabled&&this.unlocked&&this.ctx&&this.ctx.state!=="closed"}get now(){return this.ctx?this.ctx.currentTime:0}_buildNoise(e){const t=Math.floor(this.ctx.sampleRate*e),i=this.ctx.createBuffer(1,t,this.ctx.sampleRate),s=i.getChannelData(0);for(let r=0;r<t;r++)s[r]=Math.random()*2-1;return i}_tone({type:e="sine",freq:t=220,freqEnd:i=null,duration:s=.25,gain:r=.2,attack:a=.004,detune:o=0,delay:l=0}){if(!this.ready)return;const c=this.ctx,u=c.currentTime+l,d=c.createOscillator(),h=c.createGain();d.type=e,d.detune.value=o,d.frequency.setValueAtTime(Math.max(t,1),u),i!==null&&d.frequency.exponentialRampToValueAtTime(Math.max(i,1),u+s),h.gain.setValueAtTime(1e-4,u),h.gain.exponentialRampToValueAtTime(Math.max(r,2e-4),u+a),h.gain.exponentialRampToValueAtTime(1e-4,u+s),d.connect(h),h.connect(this.filter),d.start(u),d.stop(u+s+.02),d.onended=()=>{d.disconnect(),h.disconnect()}}_noise({duration:e=.2,gain:t=.25,filterType:i="bandpass",freq:s=800,freqEnd:r=null,q:a=1.2,attack:o=.003,delay:l=0}){if(!this.ready)return;const c=this.ctx,u=c.currentTime+l,d=c.createBufferSource();d.buffer=this.noiseBuffer,d.loop=!0;const h=c.createBiquadFilter();h.type=i,h.frequency.setValueAtTime(Math.max(s,20),u),r!==null&&h.frequency.exponentialRampToValueAtTime(Math.max(r,20),u+e),h.Q.value=a;const p=c.createGain();p.gain.setValueAtTime(1e-4,u),p.gain.exponentialRampToValueAtTime(Math.max(t,2e-4),u+o),p.gain.exponentialRampToValueAtTime(1e-4,u+e),d.connect(h),h.connect(p),p.connect(this.filter),d.start(u),d.stop(u+e+.02),d.onended=()=>{d.disconnect(),h.disconnect(),p.disconnect()}}setMuted(e){return this.muted=!!e,this.master&&(this.master.gain.cancelScheduledValues(this.now),this.master.gain.setTargetAtTime(this.muted?0:bt.masterGain,this.now,.02)),this.muted}setTimeDilation(e){if(!this.ready||Math.abs(e-this._dilation)<.01)return;this._dilation=e;const t=It.normal-It.bullet,i=Math.min(Math.max((e-It.bullet)/t,0),1),s=bt.filterBullet*Math.pow(bt.filterOpen/bt.filterBullet,i),r=(this.muted?0:bt.masterGain)*(bt.bulletGain+(1-bt.bulletGain)*i),a=this.now;this.filter.frequency.cancelScheduledValues(a),this.filter.frequency.setTargetAtTime(s,a,bt.filterGlide),this.master.gain.cancelScheduledValues(a),this.master.gain.setTargetAtTime(r,a,bt.filterGlide)}slingshot(e=1){this._noise({duration:.16,gain:bt.releaseGain*(.6+e*.6),filterType:"bandpass",freq:900+e*700,freqEnd:180,q:1.1}),this._tone({type:"square",freq:520+e*240,freqEnd:190,duration:.1,gain:.09})}focusEnter(){this._tone({type:"sine",freq:480,freqEnd:150,duration:.34,gain:.14})}focusExit(){this._tone({type:"sine",freq:170,freqEnd:460,duration:.2,gain:.1})}chainNote(e=0){const t=bt.scale,i=e%t.length,s=t[i]+12*Math.floor(e/t.length),r=bt.rootHz*Math.pow(2,s/12);this._tone({type:"triangle",freq:r,duration:.34,gain:bt.chainNoteGain,attack:.006}),this._tone({type:"sine",freq:r*2,duration:.18,gain:bt.chainNoteGain*.4,attack:.004})}impact(e=.5){const t=this.now;if(t-this._lastImpactAt<.03)return;this._lastImpactAt=t;const i=Math.min(Math.max(e,0),1);this._noise({duration:.14+i*.1,gain:bt.impactGain*(.5+i*.8),filterType:"lowpass",freq:1400+i*2600,freqEnd:260,q:.9}),this._tone({type:"sine",freq:140+i*90,freqEnd:52,duration:.2+i*.14,gain:.22+i*.16})}carom(){this._tone({type:"sine",freq:130,freqEnd:38,duration:.42,gain:bt.subGain}),this._noise({duration:.2,gain:.3,filterType:"bandpass",freq:2600,freqEnd:420,q:.8}),this._tone({type:"triangle",freq:330,freqEnd:165,duration:.24,gain:.14})}wallSplat(){this._noise({duration:.26,gain:.34,filterType:"lowpass",freq:900,freqEnd:120,q:1.4}),this._tone({type:"sine",freq:96,freqEnd:34,duration:.36,gain:bt.subGain*.85})}backstab(){this._tone({type:"square",freq:880,freqEnd:1320,duration:.16,gain:.13}),this._tone({type:"sine",freq:1320,duration:.22,gain:.1})}rebound(e=.5){const t=Math.min(Math.max(e,0),1);this._noise({duration:.09,gain:.14+t*.14,filterType:"bandpass",freq:1800+t*1800,freqEnd:700,q:2.2})}bumper(){this._tone({type:"square",freq:660,freqEnd:1180,duration:.13,gain:.16}),this._tone({type:"sine",freq:1320,duration:.1,gain:.09})}pyre(){this._tone({type:"sawtooth",freq:180,freqEnd:720,duration:.3,gain:.13})}enemyShot(){this._tone({type:"square",freq:420,freqEnd:220,duration:.13,gain:.1}),this._tone({type:"square",freq:300,freqEnd:150,duration:.16,gain:.07,delay:.05})}enemyDeath(){this._noise({duration:.22,gain:.2,filterType:"bandpass",freq:1800,freqEnd:300,q:.7}),this._tone({type:"triangle",freq:220,freqEnd:70,duration:.24,gain:.14})}playerHurt(){this._tone({type:"square",freq:150,freqEnd:62,duration:.28,gain:.24,detune:-18}),this._noise({duration:.14,gain:.16,filterType:"lowpass",freq:600,q:1.1})}playerDeath(){this._tone({type:"sawtooth",freq:220,freqEnd:28,duration:1.1,gain:.3}),this._noise({duration:.9,gain:.2,filterType:"lowpass",freq:1200,freqEnd:90,q:1})}roomClear(){this._tone({type:"sine",freq:120,freqEnd:40,duration:.5,gain:bt.subGain});const e=bt.rootHz;this._tone({type:"triangle",freq:e,duration:.3,gain:.16,delay:.02}),this._tone({type:"triangle",freq:e*1.5,duration:.3,gain:.15,delay:.11}),this._tone({type:"triangle",freq:e*2,duration:.45,gain:.16,delay:.2})}boonPick(){const e=bt.rootHz*1.5;for(const[t,i]of[[1,0],[1.25,.05],[1.5,.1],[2,.16]])this._tone({type:"triangle",freq:e*t,duration:.7,gain:.13,attack:.05,delay:i})}doorOpen(){this._tone({type:"sine",freq:300,freqEnd:900,duration:.35,gain:.14}),this._noise({duration:.3,gain:.12,filterType:"bandpass",freq:500,freqEnd:2600,q:1.6})}}const it={IDLE:"idle",AIMING:"aiming",LAUNCHED:"launched",DASHING:"dashing",DEAD:"dead"};class g0{constructor(e,t,i){this.max=e,this.width=t,this.color=new Ce(i),this.points=[];const s=e*2;this.positions=new Float32Array(s*3),this.colors=new Float32Array(s*3);const r=new Uint16Array((e-1)*6);for(let a=0;a<e-1;a++){const o=a*6,l=a*2;r[o]=l,r[o+1]=l+1,r[o+2]=l+2,r[o+3]=l+1,r[o+4]=l+3,r[o+5]=l+2}this.geometry=new st,this.geometry.setAttribute("position",new pt(this.positions,3)),this.geometry.setAttribute("color",new pt(this.colors,3)),this.geometry.setIndex(new pt(r,1)),this.geometry.setDrawRange(0,0),this.material=new mt({vertexColors:!0,transparent:!0,blending:_t,depthWrite:!1,side:Bt}),this.mesh=new ke(this.geometry,this.material),this.mesh.frustumCulled=!1,this.mesh.renderOrder=2}clear(){this.points.length=0,this.geometry.setDrawRange(0,0)}push(e,t,i){const s=this.points[this.points.length-1];if(s&&Math.hypot(s.x-e,s.z-t)<.06){s.intensity=Math.max(s.intensity,i);return}this.points.push({x:e,z:t,intensity:i}),this.points.length>this.max&&this.points.shift()}decay(e){for(let t=0;t<this.points.length;t++)this.points[t].intensity*=Math.exp(-3.2*e);for(;this.points.length>1&&this.points[0].intensity<.02;)this.points.shift()}rebuild(e=.16){const t=this.points.length;if(t<2){this.geometry.setDrawRange(0,0);return}const i=this.positions,s=this.colors;for(let r=0;r<t;r++){const a=this.points[r],o=this.points[Math.max(r-1,0)],l=this.points[Math.min(r+1,t-1)];let c=l.x-o.x,u=l.z-o.z;const d=Math.hypot(c,u);d<1e-5?(c=0,u=1):(c/=d,u/=d);const h=-u,p=c,_=(r/(t-1))**.7,v=this.width*.5*_*(.45+.55*a.intensity),m=r*6;i[m]=a.x+h*v,i[m+1]=e,i[m+2]=a.z+p*v,i[m+3]=a.x-h*v,i[m+4]=e,i[m+5]=a.z-p*v;const f=_*a.intensity;s[m]=this.color.r*f,s[m+1]=this.color.g*f,s[m+2]=this.color.b*f,s[m+3]=s[m],s[m+4]=s[m+1],s[m+5]=s[m+2]}this.geometry.attributes.position.needsUpdate=!0,this.geometry.attributes.color.needsUpdate=!0,this.geometry.setDrawRange(0,(t-1)*6)}dispose(){this.geometry.dispose(),this.material.dispose()}}const Ca=900;class _0{constructor(){this.group=new ri,this.group.visible=!1,this.group.renderOrder=3;const e=di.beamSlices;this.beamPositions=new Float32Array(e*2*3),this.beamColors=new Float32Array(e*2*3);const t=new Uint16Array((e-1)*6);for(let i=0;i<e-1;i++){const s=i*6,r=i*2;t[s]=r,t[s+1]=r+1,t[s+2]=r+2,t[s+3]=r+1,t[s+4]=r+3,t[s+5]=r+2}this.beamGeo=new st,this.beamGeo.setAttribute("position",new pt(this.beamPositions,3)),this.beamGeo.setAttribute("color",new pt(this.beamColors,3)),this.beamGeo.setIndex(new pt(t,1)),this.beamMat=new mt({vertexColors:!0,transparent:!0,blending:_t,depthWrite:!1,side:Bt}),this.beam=new ke(this.beamGeo,this.beamMat),this.beam.frustumCulled=!1,this.group.add(this.beam),this.primaryPositions=new Float32Array(6),this.primaryGeo=new st,this.primaryGeo.setAttribute("position",new pt(this.primaryPositions,3)),this.primaryMat=new Ri({color:ee.aim,transparent:!0,opacity:.95,depthWrite:!1}),this.primary=new Ur(this.primaryGeo,this.primaryMat),this.primary.frustumCulled=!1,this.group.add(this.primary),this.dashPositions=new Float32Array(Ca*3),this.dashGeo=new st,this.dashGeo.setAttribute("position",new pt(this.dashPositions,3)),this.dashGeo.setDrawRange(0,0),this.dashMat=new Ri({color:ee.aimGhost,transparent:!0,opacity:.7,depthWrite:!1}),this.dashes=new Is(this.dashGeo,this.dashMat),this.dashes.frustumCulled=!1,this.group.add(this.dashes),this.conePositions=new Float32Array(18),this.coneGeo=new st,this.coneGeo.setAttribute("position",new pt(this.conePositions,3)),this.coneGeo.setDrawRange(0,0),this.coneMat=new Ri({color:ee.carom,transparent:!0,opacity:.9,depthWrite:!1}),this.cone=new Is(this.coneGeo,this.coneMat),this.cone.frustumCulled=!1,this.group.add(this.cone),this.tangentPositions=new Float32Array(6),this.tangentGeo=new st,this.tangentGeo.setAttribute("position",new pt(this.tangentPositions,3)),this.tangentGeo.setDrawRange(0,0),this.tangentMat=new Ri({color:ee.player,transparent:!0,opacity:.75,depthWrite:!1}),this.tangent=new Is(this.tangentGeo,this.tangentMat),this.tangent.frustumCulled=!1,this.group.add(this.tangent),this.markerMat=new mt({color:ee.bone,transparent:!0,opacity:.5,depthWrite:!1,blending:_t}),this.marker=new ke(new Wi(be.radius*.88,be.radius,32),this.markerMat),this.marker.rotation.x=-Math.PI/2,this.marker.visible=!1,this.group.add(this.marker),this.pullPositions=new Float32Array(6),this.pullGeo=new st,this.pullGeo.setAttribute("position",new pt(this.pullPositions,3)),this.pullMat=new Ri({color:ee.player,transparent:!0,opacity:.55,depthWrite:!1}),this.pull=new Ur(this.pullGeo,this.pullMat),this.pull.frustumCulled=!1,this.group.add(this.pull),this.anchorMat=new mt({color:ee.player,transparent:!0,opacity:.8,blending:_t,depthWrite:!1}),this.anchor=new ke(new Gs(.22,16),this.anchorMat),this.anchor.rotation.x=-Math.PI/2,this.group.add(this.anchor)}hide(){this.group.visible=!1}show(e,t,i,s=1){this.group.visible=!0;const r=.12,a=e.segments;if(a.length>0){const d=a[0],h=d.bx-d.ax,p=d.bz-d.az,_=Math.hypot(h,p)||1,v=h/_,m=p/_,f=-m,T=v,R=di.beamSlices,S=i>=.985?1:0,E=(di.beamWidth+(di.beamWidthMax-di.beamWidth)*i)*(1+S*.45),b=new Ce(e.hit?ee.carom:ee.aim),P=performance.now()/1e3;for(let x=0;x<R;x++){const y=x/(R-1),A=E*(1-.2*y)*.5,C=d.ax+v*_*y,L=d.az+m*_*y,O=x*6;this.beamPositions[O]=C+f*A,this.beamPositions[O+1]=r,this.beamPositions[O+2]=L+T*A,this.beamPositions[O+3]=C-f*A,this.beamPositions[O+4]=r,this.beamPositions[O+5]=L-T*A;const B=y<=s?1:.45,F=.86+.14*Math.sin((y*5-P*3.4)*Math.PI*2),k=s<1&&Math.abs(y-s)<.06?2.1:1,V=B*F*k;this.beamColors[O]=b.r*V,this.beamColors[O+1]=b.g*V,this.beamColors[O+2]=b.b*V,this.beamColors[O+3]=this.beamColors[O],this.beamColors[O+4]=this.beamColors[O+1],this.beamColors[O+5]=this.beamColors[O+2]}this.beamGeo.attributes.position.needsUpdate=!0,this.beamGeo.attributes.color.needsUpdate=!0,this.beam.visible=!0}else this.beam.visible=!1;if(a.length>0){const d=a[0];this.primaryPositions.set([d.ax,r,d.az,d.bx,r,d.bz]),this.primaryGeo.attributes.position.needsUpdate=!0,this.primary.visible=!0,this.primaryMat.opacity=.45+.5*i,this.primaryMat.color.setHex(e.hit?ee.carom:ee.aim)}else this.primary.visible=!1;let o=0;for(let d=1;d<a.length&&o<Ca-2;d++){const h=a[d],p=h.bx-h.ax,_=h.bz-h.az,v=Math.hypot(p,_);if(v<1e-4)continue;const m=p/v,f=_/v,T=di.dashLength+di.dashGap;for(let R=0;R<v&&o<Ca-2;R+=T){const S=Math.min(R+di.dashLength,v);this.dashPositions[o*3]=h.ax+m*R,this.dashPositions[o*3+1]=r,this.dashPositions[o*3+2]=h.az+f*R,o++,this.dashPositions[o*3]=h.ax+m*S,this.dashPositions[o*3+1]=r,this.dashPositions[o*3+2]=h.az+f*S,o++}}if(this.dashGeo.setDrawRange(0,o),this.dashGeo.attributes.position.needsUpdate=!0,e.hit&&e.caromDir){const d=e.hit,h=e.caromDir,p=Math.atan2(h.z,h.x),_=di.caromConeLength,v=d.body?d.body.x:d.x,m=d.body?d.body.z:d.z;this.conePositions.set([v,r,m,v+Math.cos(p)*_,r,m+Math.sin(p)*_]),this.coneGeo.setDrawRange(0,2),this.coneGeo.attributes.position.needsUpdate=!0,this.cone.visible=!0,this.marker.visible=!0,this.marker.position.set(d.x,r,d.z);const f=a[a.length-1];let T=f?f.bx-f.ax:0,R=f?f.bz-f.az:0;const S=Math.hypot(T,R);if(S>1e-5){T/=S,R/=S;let E=-h.z,b=h.x;E*T+b*R<0&&(E=-E,b=-b);const P=di.tangentLength;this.tangentPositions.set([d.x,r,d.z,d.x+E*P,r,d.z+b*P]),this.tangentGeo.setDrawRange(0,2),this.tangentGeo.attributes.position.needsUpdate=!0,this.tangent.visible=!0}else this.tangent.visible=!1}else this.cone.visible=!1,this.marker.visible=!1,this.tangent.visible=!1;const l=t.aimCue;this.pullPositions.set([t.x,r,t.z,l.x,r,l.z]),this.pullGeo.attributes.position.needsUpdate=!0,this.pull.visible=!0,this.anchor.visible=!0,this.anchor.position.set(l.x,r,l.z);const c=i>=.985,u=c?.55+.45*Math.sin(performance.now()/42):0;this.pullMat.color.setHex(c?ee.carom:ee.aim),this.pullMat.opacity=c?.85+.15*u:.35+.5*i,this.anchorMat.color.setHex(c?ee.carom:ee.player),this.anchor.scale.setScalar((.7+i*.9)*(c?1.6+.5*u:1))}dispose(){this.beamGeo.dispose(),this.beamMat.dispose(),this.primaryGeo.dispose(),this.primaryMat.dispose(),this.dashGeo.dispose(),this.dashMat.dispose(),this.coneGeo.dispose(),this.coneMat.dispose(),this.tangentGeo.dispose(),this.tangentMat.dispose(),this.marker.geometry.dispose(),this.markerMat.dispose(),this.pullGeo.dispose(),this.pullMat.dispose(),this.anchor.geometry.dispose(),this.anchorMat.dispose()}}class x0{constructor(e){this.scene=e,this.x=0,this.z=De.halfH*.55,this.vx=0,this.vz=0,this.radius=be.radius,this.mass=1.6,this.drag=be.dragIdle,this.maxHp=be.maxHp,this.hp=be.maxHp,this.focus=Si.max,this.alive=!0,this.state=it.IDLE,this.bouncesUsed=0,this.launchPower=0,this.stats={damageMult:1,maxBounces:$e.baseMaxBounces,focusMax:Si.max,pierceRetention:be.pierceRetention,launchSpeedMult:1,focusRegenMult:1},this.iFrameTimer=0,this.dashTimer=0,this.dashCooldown=0,this.flashTimer=0,this.touchTimer=0,this.pyreTimer=0,this.aimPull={x:0,z:0},this.aimCue={x:0,z:0},this.aimDir={x:0,z:-1},this.aimPower=0,this.aimCharge=1,this.prediction=null,this._buildMesh()}_buildMesh(){this.group=new ri,this.bodyMat=new Bi({color:ee.player,emissive:new Ce(ee.player),emissiveIntensity:.75,roughness:.25,metalness:.15}),this.body=new ke(new ls(be.radius,24,18),this.bodyMat),this.body.position.y=be.radius,this.group.add(this.body),this.coreMat=new mt({color:ee.playerCore}),this.core=new ke(new ls(be.radius*.44,16,12),this.coreMat),this.core.position.y=be.radius,this.group.add(this.core),this.haloMat=new mt({color:ee.player,transparent:!0,opacity:.35,blending:_t,depthWrite:!1}),this.halo=new ke(new Wi(be.radius*1.05,be.radius*1.42,28),this.haloMat),this.halo.rotation.x=-Math.PI/2,this.halo.position.y=.03,this.group.add(this.halo),this.trail=new g0(be.trailPoints,be.trailWidth,ee.trail),this.aimRenderer=new _0,this.scene.add(this.group),this.scene.add(this.trail.mesh),this.scene.add(this.aimRenderer.group)}get speed(){return Math.hypot(this.vx,this.vz)}get maxBounces(){return this.stats.maxBounces}get invulnerable(){return this.iFrameTimer>0?!0:this.state===it.LAUNCHED&&this.speed>be.settleSpeed}get focusMax(){return this.stats.focusMax}get canAim(){return this.alive&&this.focus>=Si.minToAim}startAim(){return this.alive?(this.state!==it.DASHING&&(this.state=it.AIMING),this.aimPower=0,this.aimPull.x=0,this.aimPull.z=0,this.canAim):!1}updateAim(e){this.aimPull.x=e.pullX,this.aimPull.z=e.pullZ,this.aimDir.x=e.dirX,this.aimDir.z=e.dirZ,this.aimPower=e.power,this.aimCharge=e.charge??1,this.aimCue.x=e.cueX??this.x,this.aimCue.z=e.cueZ??this.z}cancelAim(){this.state===it.AIMING&&(this.state=this.speed>be.settleSpeed?it.LAUNCHED:it.IDLE),this.aimPower=0,this.prediction=null,this.aimRenderer.hide()}launch(e,t){const i=e.power??1,s=(be.launchSpeedMin+(be.launchSpeedMax-be.launchSpeedMin)*i)*this.stats.launchSpeedMult;return this.vx=e.dirX*s,this.vz=e.dirZ*s,this.state=it.LAUNCHED,this.drag=be.dragLaunched,this.bouncesUsed=0,this.launchPower=i,this.iFrameTimer=be.iFrameGrace,this.pyreTimer=0,this.aimPower=0,this.prediction=null,this.aimRenderer.hide(),t?.on?.playerLaunch?.({player:this,x:this.x,z:this.z,speed:s,power:i,dirX:e.dirX,dirZ:e.dirZ}),{speed:s,dirX:e.dirX,dirZ:e.dirZ}}dash(e,t,i){if(!this.alive||this.dashCooldown>0)return!1;const s=Math.hypot(e,t)||1;return this.vx=e/s*be.dashSpeed,this.vz=t/s*be.dashSpeed,this.state=it.DASHING,this.drag=be.dragLaunched,this.dashTimer=be.dashDuration,this.dashCooldown=be.dashCooldown,this.iFrameTimer=be.dashDuration*.8,this.bouncesUsed=0,this.aimRenderer.hide(),i?.on?.playerDash?.({player:this}),!0}endLaunch(){(this.state===it.LAUNCHED||this.state===it.DASHING)&&(this.state=it.IDLE,this.drag=be.dragIdle)}addFocus(e){this.focus=Math.min(this.focus+e,this.focusMax)}spendFocus(e){return this.focus=Math.max(0,this.focus-e),this.focus>0}heal(e){this.hp=Math.min(this.maxHp,this.hp+e)}takeDamage(e,t,i=null){return!this.alive||this.invulnerable?!1:(this.hp-=e,this.flashTimer=.12,t?.on?.playerDamaged?.({player:this,amount:e,source:i}),this.hp<=0&&(this.hp=0,this.alive=!1,this.state=it.DEAD,this.group.visible=!1,this.trail.clear(),t?.on?.playerDeath?.({player:this})),!0)}respawn(e,t){this.x=e,this.z=t,this.vx=0,this.vz=0,this.state=it.IDLE,this.drag=be.dragIdle,this.alive=!0,this.hp=this.maxHp,this.focus=this.focusMax,this.bouncesUsed=0,this.iFrameTimer=.5,this.group.visible=!0,this.trail.clear()}placeAt(e,t){this.x=e,this.z=t,this.vx=0,this.vz=0,this.state=it.IDLE,this.drag=be.dragIdle,this.bouncesUsed=0,this.iFrameTimer=.6,this.trail.clear()}update(e,t,i,s){s&&this.state===it.AIMING?this.focus=Math.max(0,this.focus-Si.drainPerSecond*t):this.focus<this.focusMax&&(this.focus=Math.min(this.focusMax,this.focus+Si.regenPerSecond*this.stats.focusRegenMult*t)),this.iFrameTimer>0&&(this.iFrameTimer-=e),this.flashTimer>0&&(this.flashTimer-=t),this.dashCooldown>0&&(this.dashCooldown-=e),this.touchTimer>0&&(this.touchTimer-=e),this.pyreTimer>0&&(this.pyreTimer-=e),this.state===it.DASHING&&(this.dashTimer-=e,this.dashTimer<=0&&this.endLaunch()),this.state===it.LAUNCHED&&this.speed<be.settleSpeed&&this.endLaunch(),this.drag=this.state===it.LAUNCHED||this.state===it.DASHING?be.dragLaunched:be.dragIdle;const r=this.speed;r>be.trailMinSpeed&&this.trail.push(this.x,this.z,Math.min(1,r/be.launchSpeed+.25)),this.trail.decay(Math.max(e,t*.25)),this.trail.rebuild(),this.group.position.set(this.x,0,this.z);const a=this.flashTimer>0?3.2:.75+Math.min(r/40,1)*1.4;if(this.bodyMat.emissiveIntensity=a,this.coreMat.color.setHex(this.flashTimer>0?16777215:ee.playerCore),r>1){const l=1+Math.min(r/be.launchSpeed,1)*.35,c=1/Math.sqrt(l);this.body.scale.set(c,c,c),this.group.rotation.y=Math.atan2(this.vx,this.vz),this.body.scale.z=l*c}else this.body.scale.setScalar(1);const o=this.invulnerable;this.haloMat.color.setHex(o?ee.player:ee.heavy),this.haloMat.opacity=o?.55+Math.sin(performance.now()/60)*.2:.34,this.halo.scale.setScalar(o?1.15:1)}showTrajectory(e){this.prediction=e,this.aimRenderer.show(e,this,this.aimPower,this.aimCharge)}hideTrajectory(){this.aimRenderer.hide()}dispose(){this.scene.remove(this.group),this.scene.remove(this.trail.mesh),this.scene.remove(this.aimRenderer.group),this.body.geometry.dispose(),this.bodyMat.dispose(),this.core.geometry.dispose(),this.coreMat.dispose(),this.halo.geometry.dispose(),this.haloMat.dispose(),this.trail.dispose(),this.aimRenderer.dispose()}}const Et={SPAWNING:"spawning",ACTIVE:"active",KNOCKED:"knocked",DEAD:"dead"},wc=1.7,xr={recoil:3.4,flashTime:.16},Pa={solid:null,stripe:null,heavy:null,shield:null,telegraph:null,charge:null,projectile:null};function ji(n,e){return Pa[n]||(Pa[n]=e()),Pa[n]}class Ac{constructor(e,t,i,s,r=1){const a=Gc[t];if(!a)throw new Error(`Unknown enemy archetype: ${t}`);this.parent=e,this.type=t,this.frozen=!1,this.disarmed=!1,this.invulnerable=!1,this.config=a,this.x=i,this.z=s,this.vx=0,this.vz=0,this.radius=a.radius,this.mass=a.mass,this.drag=$e.enemyDrag;const o=1+(r-1)*.06;this.maxHp=Math.round(a.hp*o),this.hp=this.maxHp,this.alive=!0,this.state=Et.SPAWNING,this.spawnTimer=ui.spawnTelegraph,this.facingX=0,this.facingZ=1,this.shotTimer=a.shotInterval?a.shotInterval*(.4+Math.random()*.6):0,this.chargeTimer=0,this.charging=!1,this.aimX=0,this.aimZ=1,this.fireFlash=0,this.strafeSign=Math.random()<.5?-1:1,this.flashTimer=0,this.knockTimer=0,this.caromCooldown=0,this.strikeCooldown=0,this.predictable=!0,this._buildMesh()}_buildMesh(){const e=this.config;this.group=new ri,this.group.position.set(this.x,0,this.z);let t,i;if(this.type==="solid"){const s=e.radius*1.55;t=ji("solid",()=>new Pi(s,s,s)),i=ee.solid}else this.type==="stripe"?(t=ji("stripe",()=>new vn(e.radius,e.radius,e.radius*1.5,8)),i=ee.stripe):(t=ji("heavy",()=>new vn(e.radius,e.radius,e.radius*1.2,24)),i=ee.heavy);if(this.baseColor=new Ce(i),this.material=new Bi({color:i,emissive:new Ce(i),emissiveIntensity:.55,roughness:.4,metalness:.2}),this.body=new ke(t,this.material),this.body.position.y=e.radius*.85,this.group.add(this.body),this.markerMat=new mt({color:i,transparent:!0,opacity:.3,blending:_t,depthWrite:!1}),this.marker=new ke(new Wi(e.radius*1.02,e.radius*1.24,20),this.markerMat),this.marker.rotation.x=-Math.PI/2,this.marker.position.y=.03,this.group.add(this.marker),this.type==="heavy"){const s=ji("shield",()=>new Qo(e.radius*1.2,.11,8,26,Math.PI));this.shieldMat=new mt({color:ee.shield,transparent:!0,opacity:.9,blending:_t,depthWrite:!1}),this.shield=new ke(s,this.shieldMat),this.shield.rotation.x=Math.PI/2,this.shield.position.y=e.radius*.8,this.group.add(this.shield)}if(this.telegraphMat=new mt({color:i,transparent:!0,opacity:.8,blending:_t,depthWrite:!1,side:Bt}),this.telegraph=new ke(ji("telegraph",()=>new Wi(.86,1,28)),this.telegraphMat),this.telegraph.rotation.x=-Math.PI/2,this.telegraph.position.y=.05,this.group.add(this.telegraph),this.type==="stripe"){this.gun=new ri,this.gunMat=new Bi({color:ee.stripe,emissive:new Ce(ee.projectile),emissiveIntensity:.18,roughness:.35,metalness:.5});const s=new ke(ji("stripeBarrel",()=>{const r=new vn(.17,.21,1,10);return r.rotateX(Math.PI/2),r.translate(0,0,.5),r}),this.gunMat);this.gun.add(s),this.muzzleMat=new mt({color:ee.projectile,transparent:!0,opacity:.04,blending:_t,depthWrite:!1}),this.muzzle=new ke(ji("stripeMuzzle",()=>new ls(.22,10,8)),this.muzzleMat),this.muzzle.position.z=1,this.gun.add(this.muzzle),this.gun.position.y=e.radius*1.8,this.group.add(this.gun)}this.type==="stripe"&&(this.chargeMat=new mt({color:ee.projectile,transparent:!0,opacity:0,blending:_t,depthWrite:!1,side:Bt}),this.chargeRing=new ke(ji("charge",()=>new Wi(.82,1,24)),this.chargeMat),this.chargeRing.rotation.x=-Math.PI/2,this.chargeRing.position.y=.07,this.group.add(this.chargeRing)),this.parent.add(this.group)}get speed(){return Math.hypot(this.vx,this.vz)}get isThreat(){return this.alive&&this.state===Et.ACTIVE}get isLethalProjectile(){return this.alive&&this.state===Et.KNOCKED&&this.speed>=$e.caromMinSpeed}classifyHit(e,t,i={}){if(this.type!=="heavy"){const c=e-this.x,u=t-this.z,d=Math.hypot(c,u)||1,h=c/d*this.facingX+u/d*this.facingZ;return{shielded:!1,backstab:h<$e.backstabDot,dot:h}}const s=e-this.x,r=t-this.z,a=Math.hypot(s,r)||1,o=s/a*this.facingX+r/a*this.facingZ,l=!!i.banked&&this.config.bankBreaksShield;return{shielded:o>0&&!l,backstab:o<$e.backstabDot,dot:o}}takeDamage(e,t={}){if(!this.alive||this.state===Et.SPAWNING)return{dealt:0,killed:!1,shielded:!1,backstab:!1};let i={shielded:!1,backstab:!1};t.fromX!==void 0&&t.fromZ!==void 0&&(i=this.classifyHit(t.fromX,t.fromZ,t));let s=e;i.shielded&&(s*=this.config.shieldMitigation??1),i.backstab&&(s*=(this.config.backstabMultiplier??1)+(t.backstabBonus??0)),s=Math.max(0,s),this.hp-=s,this.flashTimer=.09;const r=this.hp<=0;return r&&(this.hp=0,this.state=Et.DEAD,this.alive=!1),{dealt:s,killed:r,shielded:i.shielded,backstab:i.backstab}}applyKnock(e,t){this.vx=e,this.vz=t,this.state=Et.KNOCKED,this.drag=$e.knockedDrag,this.knockTimer=.12}update(e,t){if(!this.alive)return;const i=t.player;this.flashTimer>0&&(this.flashTimer-=e),this.fireFlash>0&&(this.fireFlash-=e),this.caromCooldown>0&&(this.caromCooldown-=e),this.knockTimer>0&&(this.knockTimer-=e);const s=i.x-this.x,r=i.z-this.z,a=Math.hypot(s,r)||1,o=s/a,l=r/a;switch(this.state){case Et.SPAWNING:this.spawnTimer-=e,this.facingX=o,this.facingZ=l,this.spawnTimer<=0&&(this.state=Et.ACTIVE,this.drag=$e.enemyDrag);break;case Et.KNOCKED:this.speed<$e.knockedSettleSpeed&&this.knockTimer<=0&&(this.state=Et.ACTIVE,this.drag=$e.enemyDrag);break;case Et.ACTIVE:this.frozen?this._holdFire(e,t,o,l):this._steer(e,t,o,l,a);break}this._updateMesh(e,a)}_steer(e,t,i,s,r){const a=this.config,o=a.accel;if(this.type==="solid"){const v=Math.sin(t.engine.elapsed*2.2+this.x)*.25,m=(i-s*v)*a.speed,f=(s+i*v)*a.speed;this.vx+=(m-this.vx)*Math.min(o*e,1),this.vz+=(f-this.vz)*Math.min(o*e,1),this.facingX=i,this.facingZ=s;return}if(this.type==="stripe"){this.facingX=i,this.facingZ=s;let v=0,m=0;r<a.preferredRange-a.rangeTolerance?(v=-i,m=-s):r>a.preferredRange+a.rangeTolerance?(v=i,m=s):(v=-s*this.strafeSign,m=i*this.strafeSign),(Math.abs(this.x)>De.halfW-2||Math.abs(this.z)>De.halfH-2)&&(this.strafeSign*=-1);const f=v*a.speed,T=m*a.speed;this.vx+=(f-this.vx)*Math.min(o*e,1),this.vz+=(T-this.vz)*Math.min(o*e,1),this.charging?(this.vx*=.82,this.vz*=.82,this.chargeTimer-=e,this.chargeTimer<=0&&(this.charging=!1,this.shotTimer=a.shotInterval,this._fire(t,this.aimX,this.aimZ))):(this.shotTimer-=e,this.shotTimer<=0&&this._beginCharge(t,i,s));return}const l=i*a.speed,c=s*a.speed;this.vx+=(l-this.vx)*Math.min(o*e,1),this.vz+=(c-this.vz)*Math.min(o*e,1);const u=Math.atan2(this.facingX,this.facingZ);let h=Math.atan2(i,s)-u;for(;h>Math.PI;)h-=Math.PI*2;for(;h<-Math.PI;)h+=Math.PI*2;const p=Math.max(-a.turnRate*e,Math.min(a.turnRate*e,h)),_=u+p;this.facingX=Math.sin(_),this.facingZ=Math.cos(_)}_holdFire(e,t,i,s){const r=this.config;if(r.shotInterval){if(this.facingX=i,this.facingZ=s,this.charging){this.chargeTimer-=e,this.chargeTimer<=0&&(this.charging=!1,this.shotTimer=r.shotInterval,this._fire(t,this.aimX,this.aimZ));return}this.shotTimer-=e,this.shotTimer<=0&&this._beginCharge(t,i,s)}}_beginCharge(e,t,i){if(this.disarmed){this.shotTimer=this.config.shotInterval;return}this.charging=!0,this.chargeTimer=this.config.chargeTime,this.aimX=t,this.aimZ=i,e.audio?.enemyCharge?.()}muzzlePoint(e=this.facingX,t=this.facingZ){const i=wc+this.config.shotRadius*.5;return{x:this.x+e*i,z:this.z+t*i}}_fire(e,t,i){const s=this.config,r=this.muzzlePoint(t,i);if(e.physics?.pointBlocked?.(r.x,r.z,s.shotRadius)){this.shotTimer=s.shotInterval*.35,this.fireFlash=0;return}const a=new v0(this.parent,r.x,r.z,t*s.shotSpeed,i*s.shotSpeed,s.shotDamage,s.shotRadius,s.shotLife);e.projectiles.push(a),this.frozen||(this.vx-=t*xr.recoil,this.vz-=i*xr.recoil),this.fireFlash=xr.flashTime,e.audio?.enemyShot(),e.on?.enemyFired?.({enemy:this,x:r.x,z:r.z,dirX:t,dirZ:i})}_updateMesh(e,t){this.group.position.set(this.x,0,this.z),this.group.rotation.y=Math.atan2(this.facingX,this.facingZ);const i=this.state===Et.KNOCKED,s=this.state===Et.SPAWNING;let r=.55;if(i&&(r=1.1+Math.min(this.speed/30,1)*1.6),this.flashTimer>0&&(r=3.4),s&&(r=.2),this.material.emissiveIntensity=r,this.material.color.copy(this.baseColor),i&&this.material.color.lerp(new Ce(16777215),.45),this.material.transparent=s,this.material.opacity=s?.3:1,i&&this.speed>1){const a=1+Math.min(this.speed/40,1)*.5,o=1/Math.sqrt(a);this.body.scale.set(o,o,o),this.group.rotation.y=Math.atan2(this.vx,this.vz),this.body.scale.z=a*o}else if(this.type==="solid"){const a=performance.now()/1e3;this.body.rotation.y+=e*1.4,this.body.position.y=this.radius*.85+Math.sin(a*3+this.x)*.06,this.body.scale.setScalar(1)}else this.body.scale.setScalar(1);if(s){const a=1-this.spawnTimer/ui.spawnTelegraph;this.telegraph.visible=!0,this.telegraph.scale.setScalar((2.6-a*1.4)*this.radius),this.telegraphMat.opacity=.15+a*.7}else this.telegraph.visible&&(this.telegraph.visible=!1);if(this.chargeRing)if(this.charging){const a=1-this.chargeTimer/this.config.chargeTime;this.chargeRing.visible=!0,this.chargeRing.scale.setScalar((2.4-a*1.3)*this.radius),this.chargeMat.opacity=.25+a*.7}else this.chargeRing.visible=!1;if(this.gun&&this._updateGun(e),this.shieldMat&&(this.shieldMat.opacity=.55+(t<12?.35:.1)),this.state===Et.ACTIVE){const a=.42+Math.sin(performance.now()/300+this.x)*.1;this.markerMat.color.setHex(ee.hazard),this.markerMat.opacity=a,this.marker.scale.setScalar(1)}else i?(this.markerMat.color.setHex(ee.carom),this.markerMat.opacity=.6,this.marker.scale.setScalar(1.18)):(this.markerMat.color.copy(this.baseColor),this.markerMat.opacity=.08,this.marker.scale.setScalar(1))}_updateGun(e){const t=this.config,i=this.fireFlash>0?this.fireFlash/xr.flashTime:0,s=this.charging?1-this.chargeTimer/t.chargeTime:0;if(this.charging||i>0){const o=Math.atan2(this.aimX,this.aimZ);this.gun.rotation.y=o-this.group.rotation.y}else this.gun.rotation.y=0;const r=Math.max(s,i);this.gun.scale.z=(.55+.45*r)*wc,this.gun.rotation.x=-.16*(1-r),this.gun.position.z=-.26*i,this.gun.position.y=t.radius*(1.8+s*.12),this.gunMat.emissiveIntensity=.18+s*2.2+i*4;const a=.5+s*.9+i*2.4;this.muzzle.scale.setScalar(a),this.muzzleMat.opacity=Math.min(1,.04+s*.8+i*.96)}dispose(){this.parent.remove(this.group),this.material.dispose(),this.markerMat.dispose(),this.marker.geometry.dispose(),this.telegraphMat.dispose(),this.shieldMat&&this.shieldMat.dispose(),this.chargeMat&&this.chargeMat.dispose()}}class v0{constructor(e,t,i,s,r,a,o,l){this.parent=e,this.x=t,this.z=i,this.vx=s,this.vz=r,this.damage=a,this.radius=o,this.life=l,this.alive=!0,this.drag=0,this.spawnFrame=!0,this.material=new mt({color:ee.projectile}),this.mesh=new ke(ji("projectile",()=>new ls(1,10,8)),this.material),this.mesh.scale.setScalar(o),this.mesh.position.set(t,o+.2,i),this.haloMat=new mt({color:ee.projectile,transparent:!0,opacity:.4,blending:_t,depthWrite:!1}),this.halo=new ke(new Gs(o*2.4,14),this.haloMat),this.halo.rotation.x=-Math.PI/2,this.halo.position.set(t,.05,i),e.add(this.mesh),e.add(this.halo)}update(e){this.life-=e,this.life<=0&&(this.alive=!1),this.mesh.position.set(this.x,this.radius+.2,this.z),this.halo.position.set(this.x,.05,this.z),this.haloMat.opacity=.25+Math.min(this.life,.4)}dispose(){this.parent.remove(this.mesh),this.parent.remove(this.halo),this.material.dispose(),this.halo.geometry.dispose(),this.haloMat.dispose()}}const ni=1e-6;function La(n,e,t,i,s=1){const r=2*(n*t+e*i);return{x:(n-r*t)*s,z:(e-r*i)*s}}function Ro(n,e,t,i,s,r,a,o){const l=n-r,c=e-a,u=s+o,d=l*t+c*i,h=l*l+c*c-u*u;if(h>0&&d>0)return 1/0;const p=d*d-h;if(p<0)return 1/0;const _=-d-Math.sqrt(p);return _<0?h<0?0:1/0:_}function M0(n,e,t,i,s,r){const a=r.x-r.hw,o=r.x+r.hw,l=r.z-r.hh,c=r.z+r.hh,u=a-s,d=o+s,h=l-s,p=c+s;let _=-1/0,v=1/0,m=-1,f=0;if(Math.abs(t)<ni){if(n<u||n>d)return null}else{const L=1/t;let O=(u-n)*L,B=(d-n)*L,F=-Math.sign(t);if(O>B){const k=O;O=B,B=k,F=Math.sign(t)}O>_&&(_=O,m=0,f=F),B<v&&(v=B)}if(Math.abs(i)<ni){if(e<h||e>p)return null}else{const L=1/i;let O=(h-e)*L,B=(p-e)*L,F=-Math.sign(i);if(O>B){const k=O;O=B,B=k,F=Math.sign(i)}O>_&&(_=O,m=1,f=F),B<v&&(v=B)}if(v<Math.max(_,0)||_===-1/0||_<0)return null;const T=n+t*_,R=e+i*_;if(m===0&&R>=l&&R<=c)return{t:_,nx:f,nz:0};if(m===1&&T>=a&&T<=o)return{t:_,nx:0,nz:f};const S=T<r.x?a:o,E=R<r.z?l:c,b=Ro(n,e,t,i,s,S,E,0);if(!Number.isFinite(b))return null;const P=n+t*b,x=e+i*b,y=P-S,A=x-E,C=Math.hypot(y,A)||1;return{t:b,nx:y/C,nz:A/C}}function S0(n,e,t,i,s){const r=De.halfW-s,a=De.halfH-s;let o=1/0,l=0,c=0;if(t>ni){const u=(r-n)/t;u>=0&&u<o&&(o=u,l=-1,c=0)}else if(t<-ni){const u=(-r-n)/t;u>=0&&u<o&&(o=u,l=1,c=0)}if(i>ni){const u=(a-e)/i;u>=0&&u<o&&(o=u,l=0,c=-1)}else if(i<-ni){const u=(-a-e)/i;u>=0&&u<o&&(o=u,l=0,c=1)}return Number.isFinite(o)?{t:o,nx:l,nz:c}:null}class y0{constructor(){this.colliders=[],this._hit={nx:0,nz:0,depth:0,collider:null}}pointBlocked(e,t,i=0){if(Math.abs(e)>De.halfW-i||Math.abs(t)>De.halfH-i)return!0;for(const s of this.colliders)if(s.type==="circle"){if(Math.hypot(e-s.x,t-s.z)<i+s.radius)return!0}else{const r=Math.min(Math.max(e,s.x-s.hw),s.x+s.hw),a=Math.min(Math.max(t,s.z-s.hh),s.z+s.hh);if(Math.hypot(e-r,t-a)<i)return!0}return!1}setColliders(e){this.colliders=e||[]}update(e,t){if(e<=0)return;const i=Math.min(Math.max(1,Math.ceil(e/It.fixedStep)),It.maxSubSteps),s=e/i;for(let a=0;a<i;a++)this.substep(s,t);const r=t.projectiles||[];for(let a=0;a<r.length;a++)r[a].spawnFrame=!1}substep(e,t){const i=t.player,s=t.enemies||[],r=t.projectiles||[];i&&i.alive&&(this.integrate(i,e),this.resolvePlayerGeometry(i,t));for(let a=0;a<s.length;a++){const o=s[a];o.alive&&(o.strikeCooldown>0&&(o.strikeCooldown-=e),o.caromCooldown>0&&(o.caromCooldown-=e),this.integrate(o,e),this.resolveEnemyGeometry(o,t))}if(i&&i.alive)for(let a=0;a<s.length;a++){const o=s[a];o.alive&&this.resolvePlayerEnemy(i,o,t)}for(let a=0;a<s.length;a++){const o=s[a];if(o.alive)for(let l=a+1;l<s.length;l++){const c=s[l];c.alive&&this.resolveEnemyPair(o,c,t)}}for(let a=0;a<r.length;a++){const o=r[a];o.alive&&(o.spawnFrame||(this.integrate(o,e),this.resolveProjectile(o,i,t)))}t.zones&&t.zones.length&&this.resolveZones(e,t)}resolveBallImpulse(e,t,i,s,r=$e.ballRestitution){const a=e.vx-t.vx,o=e.vz-t.vz,l=a*i+o*s;if(l<=0)return 0;const c=e.mass>0?1/e.mass:0,u=t.mass>0?1/t.mass:0,d=c+u;if(d<=0)return 0;const h=-(1+r)*l/d;return e.vx+=h*c*i,e.vz+=h*c*s,t.vx-=h*u*i,t.vz-=h*u*s,Math.abs(h)}integrate(e,t){e.x+=e.vx*t,e.z+=e.vz*t;const i=e.drag||0;if(i>0){const s=Math.exp(-i*t);e.vx*=s,e.vz*=s}}resolvePlayerGeometry(e,t){const i=this.resolveRails(e,$e.wallRestitution);i&&this.onPlayerRebound(e,t,i,"rail");for(let s=0;s<this.colliders.length;s++){const r=this.colliders[s],a=this.resolveCollider(e,r);a&&this.onPlayerRebound(e,t,a,r.kind||"obstacle",r)}}resolveRails(e,t){const i=De.halfW-e.radius,s=De.halfH-e.radius;let r=0,a=0,o=!1;if(e.x<-i?(e.x=-i+$e.skin,r=1,o=!0):e.x>i&&(e.x=i-$e.skin,r=-1,o=!0),e.z<-s?(e.z=-s+$e.skin,a=1,o=!0):e.z>s&&(e.z=s-$e.skin,a=-1,o=!0),!o)return null;const l=Math.hypot(r,a)||1;r/=l,a/=l;const c=Math.hypot(e.vx,e.vz);if(e.vx*r+e.vz*a<0){const u=La(e.vx,e.vz,r,a,t);e.vx=u.x,e.vz=u.z}return{nx:r,nz:a,x:e.x,z:e.z,speed:c}}resolveCollider(e,t,i=null){const s=i??t.restitution??$e.obstacleRestitution;let r=0,a=0,o=0;if(t.type==="circle"){const c=e.x-t.x,u=e.z-t.z,d=Math.hypot(c,u),h=e.radius+t.radius;if(d>=h)return null;d>ni?(r=c/d,a=u/d):(r=0,a=-1),o=h-d}else{const c=t.x-t.hw,u=t.x+t.hw,d=t.z-t.hh,h=t.z+t.hh,p=Math.min(Math.max(e.x,c),u),_=Math.min(Math.max(e.z,d),h),v=e.x-p,m=e.z-_,f=Math.hypot(v,m);if(f>ni){if(f>=e.radius)return null;r=v/f,a=m/f,o=e.radius-f}else{const T=e.x-c,R=u-e.x,S=e.z-d,E=h-e.z,b=Math.min(T,R,S,E);b===T?(r=-1,a=0,o=T+e.radius):b===R?(r=1,a=0,o=R+e.radius):b===S?(r=0,a=-1,o=S+e.radius):(r=0,a=1,o=E+e.radius)}}e.x+=r*(o+$e.skin),e.z+=a*(o+$e.skin);const l=Math.hypot(e.vx,e.vz);if(e.vx*r+e.vz*a<0){const c=La(e.vx,e.vz,r,a,s);e.vx=c.x,e.vz=c.z}return{nx:r,nz:a,x:e.x,z:e.z,speed:l}}onPlayerRebound(e,t,i,s,r=null){e.state==="launched"&&(e.bouncesUsed+=1,t.on?.playerRebound?.({player:e,x:i.x,z:i.z,nx:i.nx,nz:i.nz,speed:i.speed,kind:s,collider:r}),e.bouncesUsed>e.maxBounces&&e.endLaunch())}resolveEnemyGeometry(e,t){const i=e.state===Et.KNOCKED,s=e.speed,r=this.resolveRails(e,$e.enemyWallRestitution);r&&this._afterEnemyImpact(e,t,r,i,s,"rail",null);for(let a=0;a<this.colliders.length;a++){const o=this.colliders[a],l=this.resolveCollider(e,o,$e.enemyWallRestitution);l&&this._afterEnemyImpact(e,t,l,i,s,o.kind||"obstacle",o)}}_afterEnemyImpact(e,t,i,s,r,a,o){s&&r>=$e.wallSplatSpeed&&e.caromCooldown<=0?(e.caromCooldown=.15,t.on?.wallSplat?.({enemy:e,x:i.x,z:i.z,nx:i.nx,nz:i.nz,speed:r,kind:a,collider:o})):t.on?.enemyRebound?.({enemy:e,x:i.x,z:i.z,speed:r,kind:a})}resolvePlayerEnemy(e,t,i){const s=e.x-t.x,r=e.z-t.z,a=Math.hypot(s,r),o=e.radius+t.radius;if(a>=o||t.state===Et.SPAWNING)return;const l=a>ni?s/a:0,c=a>ni?r/a:-1,u=o-a;if((e.state===it.LAUNCHED||e.state===it.DASHING)&&e.speed>be.settleSpeed&&t.strikeCooldown<=0){const p=e.speed,_=e.bouncesUsed>0,v=i.on?.cueStrike?.({player:e,enemy:t,nx:l,nz:c,x:t.x+l*t.radius,z:t.z+c*t.radius,speed:p,banked:_})||{};if(t.strikeCooldown=.14,v.killed||!t.alive){const m=e.stats.pierceRetention;e.vx*=m,e.vz*=m;return}this.resolveBallImpulse(e,t,-l,-c,$e.ballRestitution),t.alive&&t.applyKnock(t.vx,t.vz),e.x+=l*(u+$e.skin),e.z+=c*(u+$e.skin);return}e.x+=l*(u*.65+$e.skin),e.z+=c*(u*.65+$e.skin),t.x-=l*u*.35,t.z-=c*u*.35,t.state===Et.ACTIVE&&i.on?.playerTouched?.({player:e,enemy:t})}resolveEnemyPair(e,t,i){const s=t.x-e.x,r=t.z-e.z,a=Math.hypot(s,r),o=e.radius+t.radius;if(a>=o||e.state===Et.SPAWNING||t.state===Et.SPAWNING)return;const l=a>ni?s/a:1,c=a>ni?r/a:0,u=o-a,d=e.isLethalProjectile&&e.caromCooldown<=0,h=t.isLethalProjectile&&t.caromCooldown<=0;if(d||h){const _=d&&(!h||e.speed>=t.speed)?e:t,v=_===e?t:e,m=_===e?l:-l,f=_===e?c:-c,T=_.speed;i.on?.carom?.({striker:_,target:v,x:v.x-m*v.radius,z:v.z-f*v.radius,nx:m,nz:f,speed:T}),e.caromCooldown=.15,t.caromCooldown=.15,this.resolveBallImpulse(_,v,m,f,$e.ballRestitution),v.alive&&v.applyKnock(v.vx,v.vz)}const p=u*.5+$e.skin;e.x-=l*p,e.z-=c*p,t.x+=l*p,t.z+=c*p}overlapsCollider(e,t,i,s){if(s.type==="circle")return Math.hypot(e-s.x,t-s.z)<i+s.radius;const r=Math.min(Math.max(e,s.x-s.hw),s.x+s.hw),a=Math.min(Math.max(t,s.z-s.hh),s.z+s.hh);return Math.hypot(e-r,t-a)<i}resolveProjectile(e,t,i){if(Math.abs(e.x)>De.halfW-e.radius||Math.abs(e.z)>De.halfH-e.radius){e.alive=!1,i.on?.projectileExpired?.({projectile:e,reason:"rail"});return}for(let s=0;s<this.colliders.length;s++)if(this.overlapsCollider(e.x,e.z,e.radius,this.colliders[s])){e.alive=!1,i.on?.projectileExpired?.({projectile:e,reason:"obstacle"});return}t&&t.alive&&Math.hypot(e.x-t.x,e.z-t.z)<e.radius+t.radius&&(e.alive=!1,i.on?.projectileHit?.({projectile:e,player:t}))}resolveZones(e,t){const i=t.player;if(!(!i||!i.alive))for(let s=0;s<t.zones.length;s++){const r=t.zones[s];let a;if(r.type==="circle"?a=Math.hypot(i.x-r.x,i.z-r.z)<r.radius+i.radius:a=this.overlapsCollider(i.x,i.z,i.radius,r),!a){r.contains=!1;continue}const o=!r.contains;r.contains=!0,r.kind==="hazard"?t.on?.hazardTick?.({zone:r,player:i,dt:e}):o&&t.on?.zoneEnter?.({zone:r,player:i})}}predictTrajectory(e,t,i={}){const s=i.radius??be.radius,r=i.maxBounces??di.previewBounces,a=i.maxDistance??di.maxDistance,o=i.bodies||[],l=i.colliders||this.colliders,c=[];let u=e.x,d=e.z,h=t.x,p=t.z;const _=Math.hypot(h,p),v={segments:c,hit:null,caromDir:null,bounces:0,totalDistance:0};if(_<ni)return v;h/=_,p/=_;let m=a,f=0;for(;m>ni&&f<=r;){let T=1/0,R=null;for(let F=0;F<o.length;F++){const k=o[F];if(!k||k.alive===!1||k.predictable===!1)continue;const V=Ro(u,d,h,p,s,k.x,k.z,k.radius);V<T&&(T=V,R=k)}let S=1/0,E=0,b=0,P="rail";const x=S0(u,d,h,p,s);x&&x.t<S&&(S=x.t,E=x.nx,b=x.nz,P="rail");for(let F=0;F<l.length;F++){const k=l[F];if(k.solid===!1)continue;let V=1/0,Q=0,te=0;if(k.type==="circle"){if(V=Ro(u,d,h,p,s,k.x,k.z,k.radius),Number.isFinite(V)){const se=u+h*V-k.x,pe=d+p*V-k.z,ve=Math.hypot(se,pe)||1;Q=se/ve,te=pe/ve}}else{const se=M0(u,d,h,p,s,k);se&&(V=se.t,Q=se.nx,te=se.nz)}V<S&&(S=V,E=Q,b=te,P=k.kind||"obstacle")}const y=T<=S,A=Math.min(T,S,m),C=u,L=d,O=u+h*A,B=d+p*A;if(c.push({ax:C,az:L,bx:O,bz:B,bounce:f,kind:y?"body":P}),v.totalDistance+=A,y&&Number.isFinite(T)&&T<=m){const F=R.x-O,k=R.z-B,V=Math.hypot(F,k)||1;v.hit={body:R,x:O,z:B,nx:F/V,nz:k/V,bounces:f},v.caromDir={x:F/V,z:k/V};break}if(Number.isFinite(S)&&S<=m){m-=A,u=O+E*($e.skin*4),d=B+b*($e.skin*4);const F=La(h,p,E,b,1);h=F.x,p=F.z,f+=1,v.bounces=f;continue}break}return v}}function Rc(){return{damageMult:1,maxBounces:$e.baseMaxBounces,focusMax:Si.max,pierceRetention:be.pierceRetention,launchSpeedMult:1,focusRegenMult:1,bankDamageBonus:0,firstHitBonus:0,backstabBonus:0}}const xh={damageMult:"mul",launchSpeedMult:"mul",focusRegenMult:"mul",maxBounces:"add",focusMax:"add",bankDamageBonus:"add",firstHitBonus:"add",backstabBonus:"add",pierceRetention:"max"};function Cc(n,e){for(const t of Object.keys(e)){const i=xh[t]||"add",s=e[t];i==="mul"?n[t]*=s:i==="max"?n[t]=Math.max(n[t],s):n[t]+=s}return n}const xi=n=>`${Math.round(n*100)}%`;function jn(n,e,t,i,s=null){const r=[],a=i*i;for(const o of n.enemies){if(!o.alive||o===s)continue;const l=o.x-e,c=o.z-t;l*l+c*c<=a&&r.push(o)}return r}function b0(n,e,t,i,s,r=null){return jn(n,e,t,i,r).map(a=>({e:a,d:Math.hypot(a.x-e,a.z-t)})).sort((a,o)=>a.d-o.d).slice(0,s).map(a=>a.e)}function Pc(n,e,t,i){const s=n.x-e,r=n.z-t,a=Math.hypot(s,r)||1;n.applyKnock(s/a*i,r/a*i)}const vh=[{id:"ignition",name:"Ignition",phase:"launch",glyph:"▲",flavour:"The band leaves embers.",values:(n,e)=>({radius:2.6+.35*n,dps:26*e*n,duration:3+.6*n}),desc:n=>`Leaves a burning zone at the launch point: ${Math.round(n.dps)} dmg/s for ${n.duration.toFixed(1)}s.`,effect:()=>"Leave a pool of fire behind",numbers:n=>`${Math.round(n.dps)} dmg/sec · ${n.duration.toFixed(1)}s · ${n.radius.toFixed(1)}m`,run(n,e,t){t.boons.spawnField({x:n.x,z:n.z,radius:e.radius,dps:e.dps,life:e.duration,color:ee.hazard})}},{id:"recoil-nova",name:"Recoil Nova",phase:"launch",glyph:"◎",flavour:"Every action has an equal and violent reaction.",values:(n,e)=>({radius:3.6+.5*n,damage:16*e*n,knock:16+3*n}),desc:n=>`Launching detonates a shockwave: ${Math.round(n.damage)} dmg and heavy knockback within ${n.radius.toFixed(1)}m.`,effect:()=>"Blast enemies away as you launch",numbers:n=>`${Math.round(n.damage)} damage · ${n.radius.toFixed(1)}m · knocks back`,run(n,e,t){const i=jn(t,n.x,n.z,e.radius);t.fx.shockwave(n.x,n.z,ee.player,e.radius*1.6,.4);for(const s of i)t.dealDamage(s,e.damage,{source:"boon",fromX:n.x,fromZ:n.z}),Pc(s,n.x,n.z,e.knock);i.length&&t.audio.impact(.5)}},{id:"break-pulse",name:"Break Pulse",phase:"launch",glyph:"⟐",flavour:"The break is the whole game.",values:(n,e)=>({bonus:.45*e*n}),desc:n=>`The first hit of every launch deals +${xi(n.bonus)} damage.`,effect:()=>"Your first hit each shot hits harder",numbers:n=>`+${xi(n.bonus)} damage`,stats:n=>({firstHitBonus:n.bonus}),run(){}},{id:"blade-rift",name:"Blade Rift",phase:"trajectory",glyph:"≡",flavour:"The line itself cuts.",values:(n,e)=>({radius:1.5+.18*n,dps:34*e*n}),desc:n=>`Your flight path shreds: ${Math.round(n.dps)} dmg/s to anything you pass.`,effect:()=>"Damage everything you fly through",numbers:n=>`${Math.round(n.dps)} dmg/sec · ${n.radius.toFixed(1)}m trail`,run(n,e,t){const i=n.player;if(i.speed<be.settleSpeed)return;const s=jn(t,i.x,i.z,e.radius+i.radius);for(const r of s)t.dealDamage(r,e.dps*n.dt,{source:"rift",silent:!0,fromX:i.x,fromZ:i.z});s.length&&Math.random()<.4&&t.fx.burst(i.x,i.z,2,ee.aim,5,.5)}},{id:"aegis",name:"Aegis",phase:"trajectory",glyph:"⌒",flavour:"Forward is the safest direction.",values:(n,e)=>({radius:2.2+.4*n,cone:.2+.1*e}),desc:n=>`A frontal deflection shield destroys enemy shots within ${n.radius.toFixed(1)}m while airborne.`,effect:()=>"Destroy enemy shots in your path",numbers:n=>`${n.radius.toFixed(1)}m shield · only while flying`,run(n,e,t){const i=n.player,s=i.speed;if(s<be.settleSpeed)return;const r=i.vx/s,a=i.vz/s;for(const o of t.projectiles){if(!o.alive)continue;const l=o.x-i.x,c=o.z-i.z,u=Math.hypot(l,c);u>e.radius+i.radius||(u>0?l/u*r+c/u*a:1)<.2-e.cone||(o.alive=!1,t.fx.burst(o.x,o.z,8,ee.player,8,.6),t.audio.rebound(.7))}}},{id:"phase-drift",name:"Phase Drift",phase:"trajectory",glyph:"⇢",flavour:"Bodies are a suggestion.",values:(n,e)=>({retention:Math.min(.99,be.pierceRetention+.05*e*n),speed:1+.06*e*n}),desc:n=>`Pierce with ${xi(n.retention)} speed retained and launch ${xi(n.speed-1)} faster.`,effect:()=>"Keep your speed after a kill",numbers:n=>`${xi(n.retention)} speed kept · +${xi(n.speed-1)} launch speed`,stats:n=>({pierceRetention:n.retention,launchSpeedMult:n.speed}),run(){}},{id:"chain-arc",name:"Chain Arc",phase:"impact",glyph:"⚡",flavour:"Contact is a conductor.",values:(n,e)=>({targets:1+n,radius:5+.5*n,damage:14*e*n}),desc:n=>`Impacts zap ${n.targets} nearby target${n.targets>1?"s":""} for ${Math.round(n.damage)} damage.`,effect:n=>`Lightning jumps to ${n.targets} more enem${n.targets>1?"ies":"y"}`,numbers:n=>`${Math.round(n.damage)} damage each · ${n.radius.toFixed(1)}m reach`,run(n,e,t){const i=b0(t,n.x,n.z,e.radius,e.targets,n.enemy);for(const s of i)t.fx.zap(n.x,n.z,s.x,s.z,ee.aim),t.dealDamage(s,e.damage,{source:"arc",fromX:n.x,fromZ:n.z})}},{id:"shatter-crit",name:"Shatter Crit",phase:"impact",glyph:"✶",flavour:"Hit them where the shield is not.",values:(n,e)=>({bonus:1*e*n}),desc:n=>`Backstabs deal an additional +${xi(n.bonus)} damage.`,effect:()=>"Hits from behind do far more",numbers:n=>`+${xi(n.bonus)} backstab damage`,stats:n=>({backstabBonus:n.bonus}),run(n,e,t){n.result?.backstab&&t.fx.shockwave(n.x,n.z,ee.heavy,3.4,.32)}},{id:"concussive",name:"Concussive",phase:"impact",glyph:"◇",flavour:"Make your own caroms.",values:(n,e)=>({radius:3.2+.4*n,knock:15+4*e*n}),desc:n=>`Impacts blast neighbours outward at ${Math.round(n.knock)} m/s — free caroms.`,effect:()=>"Knock nearby enemies flying",numbers:n=>`${Math.round(n.knock)} m/s blast · ${n.radius.toFixed(1)}m · makes caroms`,run(n,e,t){const i=jn(t,n.x,n.z,e.radius,n.enemy);if(i.length){t.fx.shockwave(n.x,n.z,ee.player,e.radius*1.5,.3);for(const s of i)Pc(s,n.x,n.z,e.knock)}}},{id:"trickshot",name:"Trickshot",phase:"rebound",glyph:"⤡",flavour:"Two rails, one answer.",values:(n,e)=>({bounces:2*n,damage:.5*e*n}),desc:n=>`+${n.bounces} wall bounces and +${xi(n.damage)} damage per rail banked.`,effect:()=>"Bank more, and hit harder each time",numbers:n=>`+${n.bounces} bounces · +${xi(n.damage)} damage per bank`,stats:n=>({maxBounces:n.bounces,bankDamageBonus:n.damage}),run(n,e,t){t.fx.burst(n.x,n.z,6,ee.carom,7,.6)}},{id:"ricochet-fuse",name:"Ricochet Fuse",phase:"rebound",glyph:"✷",flavour:"Leave something behind at every cushion.",values:(n,e)=>({radius:3+.4*n,damage:22*e*n}),desc:n=>`Each bank detonates for ${Math.round(n.damage)} damage within ${n.radius.toFixed(1)}m.`,effect:()=>"Every wall bounce explodes",numbers:n=>`${Math.round(n.damage)} damage · ${n.radius.toFixed(1)}m`,run(n,e,t){t.fx.shockwave(n.x,n.z,ee.hazard,e.radius*1.6,.34),t.fx.burst(n.x,n.z,10,ee.hazard,9,.8),t.audio.impact(.45);for(const i of jn(t,n.x,n.z,e.radius))t.dealDamage(i,e.damage,{source:"fuse",fromX:n.x,fromZ:n.z,banked:!0})}},{id:"kinetic-bank",name:"Kinetic Bank",phase:"rebound",glyph:"⇑",flavour:"The cushion gives more than it takes.",values:(n,e)=>({boost:1+.14*e*n,cap:58}),desc:n=>`Banks accelerate you by ${xi(n.boost-1)} instead of bleeding speed.`,effect:()=>"Speed up every time you bank",numbers:n=>`+${xi(n.boost-1)} speed per bounce`,run(n,e,t){const i=n.player,s=i.speed;if(s<1)return;const a=Math.min(s*e.boost,e.cap)/s;i.vx*=a,i.vz*=a,t.fx.burst(n.x,n.z,5,ee.bumper,8,.5)}}],E0=new Map(vh.map(n=>[n.id,n])),T0={launch:"Launch",trajectory:"Trajectory",impact:"Impact",rebound:"Rebound"},w0={launch:"When you launch",trajectory:"While flying",impact:"When you hit",rebound:"When you bounce"};class A0{constructor(e){this.game=e,this.owned=[],this.stats=Rc(),this.runBonus={},this.fields=[],this.fieldGroup=new ri,e.scene.add(this.fieldGroup),this._fieldGeo=new Gs(1,28),this.recompute()}rankOf(e){const t=this.owned.find(i=>i.def.id===e);return t?t.rank:0}has(e){return this.rankOf(e)>0}hooksFor(e){return this.owned.filter(t=>t.def.phase===e)}grant(e){const t=typeof e.def=="string"?E0.get(e.def):e.def;if(!t)return null;const i=e.rarity||"common",s=this.owned.find(a=>a.def.id===t.id);if(s)return s.rank=Math.min(s.rank+1,fi.maxRank),fi.rarity[i].scalar>fi.rarity[s.rarity].scalar&&(s.rarity=i),s.values=t.values(s.rank,fi.rarity[s.rarity].scalar),this.recompute(),s;const r={def:t,rank:1,rarity:i,values:t.values(1,fi.rarity[i].scalar)};return this.owned.push(r),this.recompute(),r}addRunBonus(e){for(const t of Object.keys(e))(xh[t]||"add")==="mul"?this.runBonus[t]=(this.runBonus[t]??1)*e[t]:this.runBonus[t]=(this.runBonus[t]??0)+e[t];this.recompute()}recompute(){const e=Rc();for(const t of this.owned)typeof t.def.stats=="function"&&Cc(e,t.def.stats(t.values));return Cc(e,this.runBonus),this.stats=e,this.applyTo(this.game.player),e}applyTo(e){e&&(Object.assign(e.stats,this.stats),e.focus=Math.min(e.focus,e.stats.focusMax))}reset(){this.owned.length=0,this.runBonus={},this.clearFields(),this.recompute()}rollRarity(e=Math.random){const t=e();let i=0;for(const[s,r]of Object.entries(fi.rarity))if(i+=r.weight,t<=i)return s;return"common"}rollOffer(e=fi.offerCount,t=Math.random,i=null){const s=vh.filter(l=>this.rankOf(l.id)<fi.maxRank);if(!s.length)return[];const r=s.map(l=>({def:l,weight:i&&l.phase===i?3:1})),a=[],o=new Set;for(let l=0;l<e&&o.size<s.length;l++){const c=r.filter(v=>!o.has(v.def.id)),u=c.reduce((v,m)=>v+m.weight,0);let d=t()*u,h=c[c.length-1];for(const v of c)if(d-=v.weight,d<=0){h=v;break}o.add(h.def.id);const p=this.rollRarity(t),_=Math.min(this.rankOf(h.def.id)+1,fi.maxRank);a.push({def:h.def,rarity:p,rank:_,values:h.def.values(_,fi.rarity[p].scalar),owned:this.rankOf(h.def.id)>0})}return a}_dispatch(e,t){const i=this.hooksFor(e);for(let s=0;s<i.length;s++)i[s].def.run(t,i[s].values,this.game)}onLaunch(e){this._dispatch("launch",e)}onTrajectory(e){this._dispatch("trajectory",e)}onImpact(e){this._dispatch("impact",e)}onRebound(e){this._dispatch("rebound",e)}spawnField({x:e,z:t,radius:i,dps:s,life:r,color:a}){const o=new mt({color:a,transparent:!0,opacity:.32,blending:_t,depthWrite:!1,side:Bt}),l=new ke(this._fieldGeo,o);l.rotation.x=-Math.PI/2,l.position.set(e,.04,t),l.scale.setScalar(i),this.fieldGroup.add(l),this.fields.push({x:e,z:t,radius:i,dps:s,life:r,maxLife:r,mesh:l,material:o,tick:0})}clearFields(){for(const e of this.fields)this.fieldGroup.remove(e.mesh),e.material.dispose();this.fields.length=0}update(e,t){for(let i=this.fields.length-1;i>=0;i--){const s=this.fields[i];if(s.life-=e,s.life<=0){this.fieldGroup.remove(s.mesh),s.material.dispose(),this.fields.splice(i,1);continue}const r=s.life/s.maxLife;if(s.material.opacity=.12+r*.28,s.mesh.scale.setScalar(s.radius*(.9+Math.sin(s.life*9)*.03)),s.tick-=e,s.tick<=0){s.tick=.2;for(const a of jn(t,s.x,s.z,s.radius))t.dealDamage(a,s.dps*.2,{source:"field",silent:!0,fromX:s.x,fromZ:s.z})}}}dispose(){this.clearFields(),this.game.scene.remove(this.fieldGroup),this._fieldGeo.dispose()}}const R0=(n,e)=>e[Math.floor(n()*e.length)%e.length],Lc=Fh.layouts,vr=[{id:"boon",label:"Upgrade",glyph:"◆",color:ee.door,weight:3,describe:n=>`${n?n.toUpperCase():"ANY"} BOON`},{id:"repair",label:"Repair",glyph:"✚",color:5111710,weight:1},{id:"focus",label:"Focus",glyph:"◯",color:ee.player,weight:1},{id:"power",label:"Power",glyph:"⌃",color:ee.solid,weight:1},{id:"ricochet",label:"Ricochet",glyph:"⤢",color:ee.carom,weight:1}],Dc=["launch","trajectory","impact","rebound"],ws=.9;class C0{constructor(e,t={}){this.game=e,this.handlers=t,this.level=0,this.runSeed=Math.random()*4294967295>>>0,this.rng=vl(this.runSeed),this.layout=null,this.colliders=[],this.waves=[],this.waveIndex=0,this.waveDelay=ws,this.cleared=!1,this.doors=[],this.scripted=!1,this.scriptedEnemies=[],this.goal=null,this.group=new ri,this.group.name="room",e.scene.add(this.group),this.enemyLayer=new ri,this.group.add(this.enemyLayer)}generate(e){this.teardown(),this.scripted=!1,this.level=e,this.rng=vl(Nh(this.runSeed,e));const t=this.rng;return this.layout=e<=2?Lc[0]:R0(t,Lc),this.colliders=this.layout.obstacles.map(i=>({...i,kind:i.kind||"obstacle",restitution:i.kind==="bumper"?1:void 0})),this.buildLayoutMeshes(),this.injectEnvironment(t,e),this.waves=this.buildWaves(t,e),this.waveIndex=0,this.waveDelay=ws,this.cleared=!1,this.game.physics.setColliders(this.colliders),this.spawnWave(0),{layout:this.layout,waves:this.waves.length,budget:this.budgetFor(e)}}loadScripted(e){return this.teardown(),this.scripted=!0,this.level=0,this.layout={id:e.id||"scripted",name:e.name||"Practice",tags:["scripted"],obstacles:e.obstacles||[],anchors:[],spawn:e.spawn||{x:0,z:11}},this.colliders=this.layout.obstacles.map(t=>({...t,kind:t.kind||"obstacle"})),this.buildLayoutMeshes(),this.waves=[],this.waveIndex=0,this.waveDelay=ws,this.cleared=!1,this.game.physics.setColliders(this.colliders),this.scriptedSpec=e,this.goal=e.goal?{...e.goal,scored:!1}:null,this.goal&&this.buildGoalMesh(this.goal),this.scriptedEnemies=this.spawnScripted(e.enemies||[]),this.layout}spawnScripted(e){return e.map(t=>{const i=new Ac(this.enemyLayer,t.type||"solid",t.x,t.z,1);return i.frozen=t.frozen!==!1,i.disarmed=t.disarmed===!0,i.invulnerable=t.invulnerable===!0,i.state=Et.ACTIVE,i.spawnTimer=0,i.drag=$e.enemyDrag,i.homeX=t.x,i.homeZ=t.z,this.game.enemies.push(i),i})}reRackScripted(){const e=this.scriptedSpec;if(e){for(const t of this.scriptedEnemies){t.alive=!1,t.dispose();const i=this.game.enemies.indexOf(t);i>=0&&this.game.enemies.splice(i,1)}this.goal&&(this.goal.scored=!1),this.scriptedEnemies=this.spawnScripted(e.enemies||[])}}buildGoalMesh(e){const t=new ri,i=ee.solid,s=new ke(new Pi(e.hw*2,.12,e.hh*2),new mt({color:i,transparent:!0,opacity:.32,blending:_t,depthWrite:!1}));s.position.set(e.x,.06,e.z),t.add(s);const r=new Eo(new st().setFromPoints([new I(-e.hw,0,-e.hh),new I(e.hw,0,-e.hh),new I(e.hw,0,e.hh),new I(-e.hw,0,e.hh)]),new Ri({color:i,transparent:!0,opacity:.95}));return r.position.set(e.x,.09,e.z),t.add(r),this.group.add(t),e.meshes=t,e.material=s.material,t}inGoal(e,t,i=0){const s=this.goal;return s?Math.abs(e-s.x)<s.hw+i&&Math.abs(t-s.z)<s.hh+i:!1}budgetFor(e){return Oh(e)}buildWaves(e,t){return zh(this.layout,t,e)}injectEnvironment(e,t){if(this.game.zones.length=0,t<ui.injectors.minLevel)return;const i=this.layout.anchors.filter(o=>Math.hypot(o.x-this.layout.spawn.x,o.z-this.layout.spawn.z)>=ui.safeSpawnRadius&&!this.overlapsObstacle(o.x,o.z,2));for(let o=i.length-1;o>0;o--){const l=Math.floor(e()*(o+1));[i[o],i[l]]=[i[l],i[o]]}let s=0,r=0;const a=[{kind:"bumper",chance:ui.injectors.bumperChance},{kind:"pyre",chance:ui.injectors.pyreChance},{kind:"hazard",chance:ui.injectors.hazardChance}];for(const o of a){if(s>=ui.injectors.maxPerRoom)break;if(e()>o.chance)continue;const l=i[r++%Math.max(i.length,1)];if(!l)break;this.spawnInjector(o.kind,l.x,l.z),s++}}spawnInjector(e,t,i){if(e==="bumper"){const a={type:"circle",x:t,z:i,radius:zt.bumper.radius,kind:"bumper",restitution:1};this.colliders.push(a);const o=new ke(new vn(zt.bumper.radius,zt.bumper.radius*.8,.5,20),new Bi({color:ee.bumper,emissive:new Ce(ee.bumper),emissiveIntensity:.6,roughness:.3}));o.position.set(t,.25,i),this.group.add(o),a.mesh=o;return}if(e==="pyre"){const a={type:"circle",x:t,z:i,radius:zt.pyre.radius,kind:"pyre",contains:!1};this.game.zones.push(a);const o=new ke(new Wi(zt.pyre.radius*.35,zt.pyre.radius,28),new mt({color:ee.pyre,transparent:!0,opacity:.3,blending:_t,depthWrite:!1,side:Bt}));o.rotation.x=-Math.PI/2,o.position.set(t,.04,i),this.group.add(o),a.mesh=o;return}const s={type:"box",x:t,z:i,hw:zt.hazard.width/2,hh:zt.hazard.height/2,kind:"hazard",contains:!1};this.game.zones.push(s);const r=new ke(new Un(zt.hazard.width,zt.hazard.height),new mt({color:ee.hazard,transparent:!0,opacity:.35,blending:_t,depthWrite:!1,side:Bt}));r.rotation.x=-Math.PI/2,r.position.set(t,.035,i),this.group.add(r),s.mesh=r}overlapsObstacle(e,t,i){for(const s of this.colliders)if(s.type==="circle"){if(Math.hypot(e-s.x,t-s.z)<i+s.radius)return!0}else{const r=Math.min(Math.max(e,s.x-s.hw),s.x+s.hw),a=Math.min(Math.max(t,s.z-s.hh),s.z+s.hh);if(Math.hypot(e-r,t-a)<i)return!0}return!1}buildLayoutMeshes(){for(const e of this.colliders){const t=e.kind==="bumper",i=t?ee.bumper:ee.railGlow;let s;e.type==="circle"?(s=new ke(new vn(e.radius,e.radius*.92,t?.55:1.1,22),new Bi({color:t?ee.bumper:ee.rail,emissive:new Ce(i),emissiveIntensity:t?.55:.35,roughness:.45,metalness:.3})),s.position.set(e.x,t?.28:.55,e.z)):(s=new ke(new Pi(e.hw*2,1.1,e.hh*2),new Bi({color:ee.rail,emissive:new Ce(ee.railGlow),emissiveIntensity:.4,roughness:.5,metalness:.3})),s.position.set(e.x,.55,e.z)),this.group.add(s),e.mesh=s;let r;if(e.type==="circle")r=new ke(new Wi(e.radius*1.02,e.radius*1.16,26),new mt({color:i,transparent:!0,opacity:.45,blending:_t,depthWrite:!1,side:Bt})),r.rotation.x=-Math.PI/2;else{const a=e.hw+.06,o=e.hh+.06;r=new Eo(new st().setFromPoints([new I(-a,0,-o),new I(a,0,-o),new I(a,0,o),new I(-a,0,o)]),new Ri({color:i,transparent:!0,opacity:.85}))}r.position.set(e.x,.03,e.z),this.group.add(r),e.outline=r}}spawnWave(e){const t=this.waves[e];if(t){for(const i of t)this.game.enemies.push(new Ac(this.enemyLayer,i.type,i.x,i.z,this.level));this.waveIndex=e}}get wavesRemaining(){return Math.max(0,this.waves.length-this.waveIndex-1)}rollReward(e){const t=vr.reduce((s,r)=>s+r.weight,0);let i=e()*t;for(const s of vr)if(i-=s.weight,i<=0)return s;return vr[0]}spawnDoors(){const e=this.rng,t=ui.door.count,i=this.level%Qt.healEvery===0,s=[];for(let o=0;o<t;o++){let l=this.rollReward(e);o===0&&i&&(l=vr.find(u=>u.id==="repair"));let c=0;for(;s.some(u=>u.id===l.id)&&c++<12;)l=this.rollReward(e);s.push(l)}const r=-De.halfH+ui.door.inset+ui.door.height/2,a=De.width/(t+1);return this.doors=s.map((o,l)=>{const c=-De.halfW+a*(l+1),u=o.id==="boon"?Dc[Math.floor(e()*Dc.length)]:null,d=l===0?ee.door:ee.doorAlt,h={reward:o,phase:u,x:c,z:r,hw:ui.door.width/2,hh:ui.door.height/2,color:d,taken:!1,pulse:e()*Math.PI*2};return h.meshes=this.buildDoorMesh(h),h}),this.doors}buildDoorMesh(e){const t=new ri;t.position.set(e.x,0,e.z);const i=new ke(new Pi(e.hw*2,.14,e.hh*2),new mt({color:e.color,transparent:!0,opacity:.35,blending:_t,depthWrite:!1}));i.position.y=.07,t.add(i);const s=new ke(new Pi(e.hw*2+.3,1.4,.22),new Bi({color:ee.rail,emissive:new Ce(e.color),emissiveIntensity:1.4,roughness:.4}));s.position.set(0,.7,-e.hh),t.add(s);const r=new vn(.16,.16,1.6,12),a=new Bi({color:ee.rail,emissive:new Ce(e.color),emissiveIntensity:1.6,roughness:.35});for(const o of[-1,1]){const l=new ke(r,a);l.position.set(o*e.hw,.8,0),t.add(l)}return this.group.add(t),t}clearDoors(){for(const e of this.doors)e.meshes&&this.group.remove(e.meshes);this.doors.length=0}update(e,t){if(this.scripted)return;const i=t.enemies.length;if(!this.cleared){i===0?this.wavesRemaining>0?(this.waveDelay-=e,this.waveDelay<=0&&(this.waveDelay=ws,this.spawnWave(this.waveIndex+1),this.handlers.onWaveSpawned?.({index:this.waveIndex,total:this.waves.length}))):(this.cleared=!0,this.spawnDoors(),this.handlers.onRoomClear?.({level:this.level,layout:this.layout})):this.waveDelay=ws;return}const s=t.player;for(const r of this.doors){if(r.pulse+=e*3,r.meshes){const l=1+Math.sin(r.pulse)*.06;r.meshes.scale.set(l,1,l)}if(r.taken||!s.alive)continue;const a=Math.abs(s.x-r.x)<r.hw+s.radius,o=Math.abs(s.z-r.z)<r.hh+s.radius;if(a&&o){r.taken=!0,this.handlers.onDoorEntered?.(r);return}}}teardown(){this.clearDoors();for(const e of this.game.enemies)e.dispose();this.game.enemies.length=0;for(const e of this.game.projectiles)e.dispose();this.game.projectiles.length=0,this.game.zones.length=0;for(let e=this.group.children.length-1;e>=0;e--){const t=this.group.children[e];t!==this.enemyLayer&&(this.group.remove(t),t.traverse?.(i=>{i.geometry&&i.geometry.dispose(),i.material&&(Array.isArray(i.material)?i.material.forEach(s=>s.dispose()):i.material.dispose())}))}this.colliders=[],this.doors=[],this.scriptedEnemies=[],this.goal=null,this.scriptedSpec=null,this.game.physics.setColliders([])}dispose(){this.teardown(),this.game.scene.remove(this.group)}}const Co=42,Ic=2*Math.PI*Co,P0="http://www.w3.org/2000/svg";function Ye(n,e,t){const i=document.createElement(n);return e&&(i.className=e),t&&t.appendChild(i),i}function Da(n,e,t){const i=document.createElementNS(P0,n);for(const[s,r]of Object.entries(e))i.setAttribute(s,r);return t&&t.appendChild(i),i}class L0{constructor(e,t={}){this.layer=e,this.camera=t.camera||null,this.stage=t.stage||e,this.root=Ye("div","hud",e);const i=Ye("div","hud-top",this.root),s=Ye("div","hud-hp",i);Ye("div","hud-label",s).textContent="Hull";const r=Ye("div","hp-bar",s);this.hpGhost=Ye("div","hp-ghost",r),this.hpFill=Ye("div","hp-fill",r),this.hpText=Ye("div","hp-text",s);const a=Ye("div","hud-room",i);Ye("div","hud-label",a).textContent="Room",this.roomNumber=Ye("div","room-number",a),this.roomLeft=Ye("div","room-left",a),this.waveText=Ye("div","wave-text",a);const o=Ye("div","hud-layout",i);Ye("div","hud-label",o).textContent="Table",this.layoutName=Ye("div","layout-name",o),this.buildStrip=Ye("div","hud-build",this.root),this.combo=Ye("div","hud-combo",this.root),this.comboMult=Ye("div","combo-mult",this.combo),this.comboCount=Ye("div","combo-count",this.combo),this.comboBar=Ye("div","combo-bar",this.combo),this.comboFill=Ye("div","combo-fill",this.comboBar);const l=Ye("div","hud-focus",this.root),c=Da("svg",{viewBox:"0 0 100 100",class:"focus-svg"},l);Da("circle",{cx:50,cy:50,r:Co,fill:"none",stroke:"rgba(234,246,255,0.12)","stroke-width":7},c),this.focusArc=Da("circle",{cx:50,cy:50,r:Co,fill:"none",stroke:Yr.cyan,"stroke-width":7,"stroke-linecap":"round","stroke-dasharray":Ic,"stroke-dashoffset":0,transform:"rotate(-90 50 50)"},c),this.focusValue=Ye("div","focus-value",l),Ye("div","focus-label",l).textContent="Focus",this.banner=Ye("div","hud-banner",this.root),this.bannerTitle=Ye("div","banner-title",this.banner),this.bannerSub=Ye("div","banner-sub",this.banner),this.bannerTimer=0,this.damageVeil=Ye("div","hud-damage",this.root),this.damageTimer=0,this.doorLayer=Ye("div","hud-doors",this.root),this.doorLabels=[],this._projection=new I,this._cache={hp:-1,ghost:-1,focus:-1,level:-1,wave:"",chain:-1,left:"",layout:"",buildKey:""},this._ghost=1}flashDamage(){this.damageTimer=.4}showBanner(e,t="",i=2.2){this.bannerTitle.textContent=e,this.bannerSub.textContent=t,this.bannerTimer=i,this.banner.classList.add("visible")}hideBanner(){this.bannerTimer=0,this.banner.classList.remove("visible")}setBuild(e){const t=e.map(i=>`${i.def.id}:${i.rank}:${i.rarity}`).join("|");if(t!==this._cache.buildKey){this._cache.buildKey=t,this.buildStrip.textContent="";for(const i of e){const s=Ye("div",`build-chip ${i.rarity} phase-${i.def.phase}`,this.buildStrip);Ye("span","chip-glyph",s).textContent=i.def.glyph,Ye("span","chip-name",s).textContent=i.def.name,i.rank>1&&(Ye("span","chip-rank",s).textContent=`×${i.rank}`),s.title=`${i.def.name} — ${i.def.desc(i.values)}`}}}setDoors(e){this.doorLayer.textContent="",this.doorLabels=[];for(const t of e){const i=Ye("div","door-label",this.doorLayer);i.textContent=t.text,i.style.color=t.color,i.style.borderColor=t.color,this.doorLabels.push({node:i,x:t.x,z:t.z})}}_updateDoorLabels(){if(!this.doorLabels.length||!this.camera)return;const e=this.stage.clientWidth,t=this.stage.clientHeight;for(const i of this.doorLabels){this._projection.set(i.x,.6,i.z).project(this.camera);const s=(this._projection.x*.5+.5)*e,r=(-this._projection.y*.5+.5)*t;i.node.style.transform=`translate(${s}px, ${r}px) translate(-50%, -50%)`}}update(e,t){const i=this._cache,s=Math.max(0,Math.min(1,e.hp/e.maxHp));Math.abs(s-i.hp)>.001&&(i.hp=s,this.hpFill.style.width=`${s*100}%`,this.hpText.textContent=`${Math.ceil(e.hp)}/${e.maxHp}`,this.hpFill.classList.toggle("critical",s<.3)),this._ghost>s?this._ghost=Math.max(s,this._ghost-t*.55):this._ghost=s,Math.abs(this._ghost-i.ghost)>.002&&(i.ghost=this._ghost,this.hpGhost.style.width=`${this._ghost*100}%`);const r=Math.max(0,Math.min(1,e.focus/e.focusMax));if(Math.abs(r-i.focus)>.004){i.focus=r,this.focusArc.setAttribute("stroke-dashoffset",String(Ic*(1-r))),this.focusValue.textContent=`${e.focus.toFixed(1)}s`;const l=r<.12;this.focusArc.setAttribute("stroke",l?Yr.magenta:Yr.cyan),this.root.classList.toggle("focus-low",l)}e.level!==i.level&&(i.level=e.level,this.roomNumber.textContent=e.level>0?String(e.level).padStart(2,"0"):"––");const a=e.level>0?e.enemies>0?`${e.enemies} left`:"Clear":"";a!==i.left&&(i.left=a,this.roomLeft.textContent=a,this.roomLeft.classList.toggle("clear",e.enemies===0));const o=e.waveCount>1?`Wave ${e.waveIndex+1}/${e.waveCount}`:"";if(o!==i.wave&&(i.wave=o,this.waveText.textContent=o),e.layout!==i.layout&&(i.layout=e.layout,this.layoutName.textContent=e.layout||""),e.chain!==i.chain&&(i.chain=e.chain,e.chain>1?(this.combo.classList.add("visible"),this.comboMult.textContent=`×${e.chainMult.toFixed(1)}`,this.comboCount.textContent=`${e.chain} hits`,this.combo.classList.remove("pop"),this.combo.offsetWidth,this.combo.classList.add("pop")):this.combo.classList.remove("visible")),e.chain>1&&e.chainWindow>0){const l=Math.max(0,Math.min(1,e.chainTimer/e.chainWindow));this.comboFill.style.transform=`scaleX(${l.toFixed(3)})`}this._updateDoorLabels(),this.bannerTimer>0&&(this.bannerTimer-=t,this.bannerTimer<=0&&this.banner.classList.remove("visible")),this.damageTimer>0&&(this.damageTimer-=t,this.damageVeil.style.opacity=String(Math.max(0,this.damageTimer/.4)*.55),this.damageTimer<=0&&(this.damageVeil.style.opacity="0"))}dispose(){this.root.remove()}}const Uc=["","I","II","III","IV"];function Vt(n,e,t){const i=document.createElement(n);return e&&(i.className=e),t&&t.appendChild(i),i}class D0{constructor(e){this.layer=e,this.open=!1,this.onPick=null,this.scrim=Vt("div","boon-scrim",e),this.panel=Vt("div","boon-panel",this.scrim),this.title=Vt("div","boon-title",this.panel),this.subtitle=Vt("div","boon-subtitle",this.panel),this.cards=Vt("div","boon-cards",this.panel),this.footer=Vt("div","boon-footer",this.panel),this.footer.textContent="Pick one — it applies immediately",this._onClick=this._handleClick.bind(this),this.cards.addEventListener("click",this._onClick),this.scrim.addEventListener("pointerdown",t=>t.stopPropagation()),this.scrim.addEventListener("pointerup",t=>t.stopPropagation())}show(e,t,i={}){if(this.onPick=t,this.offers=e,this.cards.textContent="",this.title.textContent="Choose an Upgrade",this.subtitle.textContent=`Room ${i.level??"?"} · pick one`,!e.length){const s=Vt("div","boon-empty",this.cards);s.textContent="Everything is already at maximum rank.",this.footer.textContent="Tap anywhere to continue",this.footer.style.display="",this.scrim.classList.add("visible"),this.open=!0,this._emptyHandler=()=>this._pick(null),this.scrim.addEventListener("click",this._emptyHandler,{once:!0});return}this.footer.textContent="",this.footer.style.display="none",e.forEach((s,r)=>{const a=fi.rarity[s.rarity]||fi.rarity.common,o=s.def,l=Vt("button",`boon-card ${s.rarity} phase-${o.phase}`,this.cards);l.type="button",l.dataset.index=String(r);const c=Vt("div","card-head",l);Vt("span","card-trigger",c).textContent=w0[o.phase]||T0[o.phase]||o.phase,Vt("span","card-rarity",c).textContent=a.label,Vt("div","card-effect",l).textContent=o.effect?o.effect(s.values):o.desc(s.values),o.numbers&&(Vt("div","card-numbers",l).textContent=o.numbers(s.values));const u=Vt("div","card-foot",l);Vt("span","card-glyph",u).textContent=o.glyph,Vt("span","card-name",u).textContent=o.name,s.owned&&(Vt("span","card-rank",u).textContent=`Rank ${Uc[s.rank-1]} → ${Uc[s.rank]}`)}),this.scrim.classList.add("visible"),this.open=!0}_handleClick(e){const t=e.target.closest(".boon-card");if(!t)return;const i=Number(t.dataset.index),s=this.offers?.[i];s&&this._pick(s)}_pick(e){const t=this.onPick;this.close(),t?.(e)}close(){this.open&&(this.open=!1,this.onPick=null,this.scrim.classList.remove("visible"),this._emptyHandler&&(this.scrim.removeEventListener("click",this._emptyHandler),this._emptyHandler=null))}dispose(){this.cards.removeEventListener("click",this._onClick),this.scrim.remove()}}const Ia="billiard-tutorial-done-v1",Nc=2.6,I0=8.6,U0={aim:{say:"Aim and shoot the <b>red ball</b>",hint:"Press <em>anywhere</em> and pull back, like a cue.",spot:"first",hand:!0,hit:()=>"score",shot:n=>n.hits===0?"reject":null,facing:"Other way — the orb fires AWAY from your thumb. Drag from below it.",cheer:"1 HIT — now make them count",whiff:"Missed — drag straight down from the blue ball and release",nudge:"Put your thumb below the blue ball and pull down. The line shows where it goes."},goal:{say:"Knock it into the <em>goal</em>",hint:"Not too hard — a <b>broken ball</b> never reaches the bar.",spot:"goal",hand:!0,handDraw:5.4,usesGoal:!0,cheer:"In the goal",scold:"Too hard — it broke on the way. Ease off the draw",whiff:"Missed the ball entirely — line up on it first",nudge:"Half a draw carries it all the way. Full power shatters it."},"pass-straight":{say:"Move it, don't <em>break</em> it",hint:"A <em>softer</em> hit sends the <b>near ball</b> into the far one.",spot:"rack",hand:!0,handDraw:4.2,softPass:!0,cheer:"2 HITS  ×1.4 — the hand-off",scold:"Too hard — it shattered instead of travelling. Ease off the draw",whiff:"Missed — take the near ball head on",nudge:"Half a draw is plenty. Hard enough to break it is too hard."},"pass-angled":{say:"Same shot, <em>on an angle</em>",hint:"Still <em>soft</em>. Clip the <b>near ball</b> so it turns into the far one.",spot:"rack",softPass:!0,cheer:"2 HITS  ×1.4 — on an angle",scold:"Too hard, or the wrong line — ease off and clip its far side",whiff:"Missed — the white ghost circle shows where you will make contact",nudge:"Line the ghost circle up so the line points at the second ball."},"pass-three":{say:"Shatter it and <em>keep going</em>",hint:"<em>Max power</em> breaks the first <b>ball</b> — your cue carries on through.",spot:"rack",shatterThrough:!0,cheer:"SHATTERED  — 3 HITS ×1.8",scold:"It survived — pull back further so the first ball breaks",whiff:"Missed — line the cue straight up at the near ball",nudge:"The first ball must SHATTER. Anything less and your cue stops there."},power:{say:"Pull back <em>further</em>",hint:"Power is how <em>far from the ball</em> your thumb is.",spot:"player",hand:!0,handDraw:9.4,clearsRack:!0,cheer:"3 HITS  ×1.8 — all yours",scold:"Not enough on it — drag your thumb further from the ball",whiff:"Missed the line — straight up the middle",nudge:"Keep dragging until the cue glows gold. That is full power."},"bank-1":{say:"Bounce off a <em>wall</em> first",hint:"The <b>red ball</b> is blocked. Aim <em>out to the right</em> — the rail brings it back in.",spot:"blocked",hit:n=>n.banked?"score":"reject",cheer:"Off the rail",scold:"No rail yet — aim into the side wall, not at the ball",whiff:"Missed — the dashed line shows where the bounce goes",nudge:"Aim well out to the side. The dashed preview is the return path."},"bank-2":{say:"Again, <em>other side</em>",hint:"Same shot mirrored. Aim <em>out to the left</em> and let the rail turn it.",spot:"blocked",hit:n=>n.banked?"score":"reject",cheer:"You have got it",scold:"Straight at it does not count — rail first",whiff:"Missed — follow the dashed line",nudge:"Aim out to the left this time and let it come back."},"bank-two-rails":{say:"<em>Two bounces</em>, then hit",hint:"Aim <em>hard right</em>. Two walls on the way round, then the <b>red ball</b>.",spot:"rack",hit:n=>n.bounces>=2?"score":"reject",cheer:"Two rails. Big points.",scold:"Only one bounce — go the long way round",whiff:"Missed — trace the dashed line before you let go",nudge:"Take it off the top wall first, then the side."}},As=Bh.lessons.map(n=>({...U0[n.id],id:n.id,goal:1,rest:n.rest||{x:0,z:-1},room:{id:`lesson-${n.id}`,name:n.name,obstacles:n.obstacles||[],enemies:n.enemies||[],goal:n.goal||null}})),N0=3.2;class gs{constructor(e){Object.assign(this,e),this.spotEl=document.createElement("div"),this.spotEl.id="coach-spot",this.ringEl=document.createElement("div"),this.ringEl.id="coach-ring",this.trackEl=document.createElement("div"),this.trackEl.id="coach-hand-track",this.handEl=document.createElement("div"),this.handEl.id="coach-hand",this.layer.appendChild(this.spotEl),this.layer.appendChild(this.ringEl),this.layer.appendChild(this.trackEl),this.layer.appendChild(this.handEl);const t=document.createElement("div");t.id="coach",t.innerHTML='<button class="skip" type="button">Skip</button><div class="step"></div><div class="say"></div><div class="hint"></div><div class="count" hidden></div><button class="next" type="button" hidden></button><div class="status"></div>',this.el=t,this.stepEl=t.querySelector(".step"),this.sayEl=t.querySelector(".say"),this.hintEl=t.querySelector(".hint"),this.countEl=t.querySelector(".count"),this.statusEl=t.querySelector(".status"),this.nextEl=t.querySelector(".next"),this.skipEl=t.querySelector(".skip"),this.layer.appendChild(t);const i=(s,r)=>{s.addEventListener("pointerdown",a=>{a.stopPropagation(),a.preventDefault(),r()})};i(this.nextEl,()=>this._advance()),i(this.skipEl,()=>this._finish()),this.active=!1,this.index=-1,this.done=0,this._roomKey=null,this._needsRoom=!1,this._launched=!1,this._wrongWay=!1,this._shotTimer=0,this._shotLesson=-1,this._hits=0,this._passes=0,this._struck=new Set,this._strikes=[],this._rejected=!1,this._awaitingNext=!1,this._misses=0}static get completed(){try{return localStorage.getItem(Ia)==="1"}catch{return!1}}static markComplete(){try{localStorage.setItem(Ia,"1")}catch{}}static reset(){try{localStorage.removeItem(Ia)}catch{}}get running(){return this.active}get lesson(){return this.active?As[this.index]:null}start(){this.resetRun(),this.game.level=0,this.active=!0,this._awaitingNext=!1,this.nextEl.hidden=!0,this.skipEl.hidden=!1,this.game.state="playing",this.game.tutorialGuard=()=>!1,this.layer.classList.add("coaching"),this._launched=!1,this.hud?.hideBanner?.(),this._enter(0)}stop(){this.active=!1,this.index=-1,this._awaitingNext=!1,this._needsRoom=!1,this._roomKey=null,this.game.tutorialGuard=null,this.layer.classList.remove("coaching"),this.spotEl.classList.remove("show"),this.ringEl.classList.remove("show"),this.handEl.classList.remove("show"),this.trackEl.classList.remove("show"),this.el.classList.remove("show","done"),this.skipEl.hidden=!0,this.nextEl.hidden=!0,this.stepEl.textContent="",this.sayEl.textContent="",this.hintEl.textContent="",this._setStatus("",null)}_finish(){gs.markComplete(),this.stop(),this.finish()}_enter(e){this.index=e,this.done=0,this._hits=0,this._struck.clear(),this._rejected=!1,this._misses=0,this._awaitingNext=!1,this.nextEl.hidden=!0;const t=this.lesson;t&&(this._render(),this._setStatus("",null),this._launched=!1,this.rooms.goal&&(this.rooms.goal.scored=!1),this._needsRoom=t.room.id!==this._roomKey,this._needsRoom?this._buildRoom():(this._reRack(),this._homeBall()))}_buildRoom(){const e=this.lesson;e&&(this.layer.classList.add("coaching"),this._needsRoom=!1,this._roomKey=e.room.id,this.hud?.hideBanner?.(),this.rooms.loadScripted(e.room),this.player.respawn(0,this.spawnZ()),this.player.focus=this.player.focusMax,this._restAim())}_restAim(){const e=this.lesson?.rest;this.input.setHeading(e?e.x:0,e?e.z:-1)}_focus(){const e=this.lesson;if(!e?.spot)return null;const t=(this.rooms.scriptedEnemies||[]).filter(i=>i.alive);switch(e.spot){case"player":return{x:this.player.x,z:this.player.z,rx:3.4,rz:3.4};case"goal":{const i=e.room.goal;return i?{x:i.x,z:i.z,rx:i.hw+1.4,rz:i.hh+.4}:null}case"first":{let i=null,s=1/0;for(const r of t){const a=(r.x-this.player.x)**2+(r.z-this.player.z)**2;a<s&&(s=a,i=r)}return i?{x:i.x,z:i.z,rx:2.8,rz:2.8}:null}case"rack":case"blocked":{if(!t.length)return null;let i=1/0,s=-1/0,r=1/0,a=-1/0;const o=(c,u,d=0,h=0)=>{i=Math.min(i,c-d),s=Math.max(s,c+d),r=Math.min(r,u-h),a=Math.max(a,u+h)};for(const c of t)o(c.x,c.z);if(e.spot==="blocked")for(const c of e.room.obstacles||[])o(c.x,c.z,c.hw||0,c.hh||0);const l=2.4;return{x:(i+s)/2,z:(r+a)/2,rx:(s-i)/2+l,rz:(a-r)/2+l}}default:return null}}_updateSpot(){const e=this.engine?.camera,i=this._awaitingNext||this._launched||this.input.isAiming?null:this._focus();if(!i||!e||!this.layer.clientWidth){this.spotEl.classList.remove("show"),this.ringEl.classList.remove("show");return}const s=this.layer.clientWidth,r=this.layer.clientHeight,a=(e.right-e.left)/e.zoom,o=(e.top-e.bottom)/e.zoom,l=((i.x-e.position.x)/a+.5)*s,c=((i.z-e.position.z)/o+.5)*r,u=i.rx/a*s,d=i.rz/o*r;for(const h of[this.spotEl,this.ringEl])h.style.setProperty("--spot-x",`${l.toFixed(1)}px`),h.style.setProperty("--spot-y",`${c.toFixed(1)}px`),h.style.setProperty("--spot-rx",`${u.toFixed(1)}px`),h.style.setProperty("--spot-ry",`${d.toFixed(1)}px`),h.classList.add("show")}_updateHand(){const e=this.lesson,t=this.engine?.camera;if(!e?.hand||this._awaitingNext||this._launched||this.input.isAiming||!t||!this.layer.clientWidth){this.handEl.classList.remove("show"),this.trackEl.classList.remove("show");return}const s=this.input.heading,r=this.layer.clientWidth,a=this.layer.clientHeight,o=(t.right-t.left)/t.zoom,l=(t.top-t.bottom)/t.zoom,c=(v,m)=>({x:((v-t.position.x)/o+.5)*r,y:((m-t.position.z)/l+.5)*a}),u=c(this.player.x-s.x*Nc,this.player.z-s.z*Nc),d=e.handDraw||I0,h=c(this.player.x-s.x*d,this.player.z-s.z*d),p=h.x-u.x,_=h.y-u.y;for(const v of[this.handEl,this.trackEl])v.style.setProperty("--hand-x",`${u.x.toFixed(1)}px`),v.style.setProperty("--hand-y",`${u.y.toFixed(1)}px`),v.style.setProperty("--hand-dx",`${p.toFixed(1)}px`),v.style.setProperty("--hand-dy",`${_.toFixed(1)}px`),v.classList.add("show");this.trackEl.style.setProperty("--hand-len",`${Math.hypot(p,_).toFixed(1)}px`),this.trackEl.style.setProperty("--hand-rot",`${(Math.atan2(_,p)*180/Math.PI).toFixed(1)}deg`)}update(e){this.active&&(this._updateSpot(),this._updateHand(),!this._awaitingNext&&(this.player.focus=this.player.focusMax,this._launched&&this.lesson?.usesGoal&&this._checkGoal(),this._launched&&!this.input.isAiming&&(this._shotTimer-=e,(this.player.state===it.IDLE||this._shotTimer<=0)&&(this._launched=!1,this._resolveShot()))))}notify(e,t={}){const i=this.lesson;if(!(!i||this._awaitingNext)){if(e==="launch"){this._wrongWay=!!i.facing&&this._awayFromRack(t),this._setStatus("",null),this._launched=!0,this._shotTimer=N0,this._shotLesson=this.index,this._hits=0,this._passes=0,this._struck.clear(),this._strikes.length=0,this._rejected=!1;return}if(e==="pass"){if(this._passes+=1,!i.pass)return;const s=i.pass({...t,depth:this._passes});s==="score"?this._score():s==="reject"&&(this._rejected=!0);return}if(e==="hit"){if(this._strikes.push({enemy:t.enemy,killed:!!t.killed}),this._hits+=1,this._wrongWay){this._rejected=!0;return}if(t.enemy&&this._struck.add(t.enemy),!i.hit)return;const s=i.hit(t);s==="score"?this._score(i.killsStruck?[...this._struck]:[t.enemy]):s==="reject"&&(this._rejected=!0)}}}_awayFromRack({dirX:e=0,dirZ:t=0}){const i=this.rooms.scriptedEnemies.filter(o=>o.alive);if(!i.length)return!1;const s=i.reduce((o,l)=>o+l.x,0)/i.length-this.player.x,r=i.reduce((o,l)=>o+l.z,0)/i.length-this.player.z,a=Math.hypot(s,r)||1;return(e*s+t*r)/a<0}_checkGoal(){const e=this.rooms;if(!(!e.goal||e.goal.scored)){for(const t of e.scriptedEnemies)if(t.alive&&e.inGoal(t.x,t.z,-t.radius*.4)){e.goal.scored=!0,this._score([t]);return}}}_resolveShot(){const e=As[this._shotLesson],t=e&&this._shotLesson===this.index&&!this._awaitingNext;if(t&&e.usesGoal&&this.done<e.goal&&(this._rejected=!0),t&&e.relay){const i=this.rooms.scriptedEnemies,s=i.filter(r=>Math.hypot(r.x-r.homeX,r.z-r.homeZ)>.6).length;this._passes>=1&&i.length&&s>=i.length?this._score():this._rejected=!0}if(t&&e.shatterThrough){const i=this._strikes[0],s=this.rooms.scriptedEnemies,r=!!i&&i.killed&&i.enemy===s[0],a=this._strikes.some(o=>o.enemy===s[1]);r&&a&&this._passes>=1?this._score():this._rejected=!0}if(t&&e.softPass){const i=this.rooms.scriptedEnemies,s=this._strikes.find(r=>r.enemy===i[0]);s&&!s.killed&&this._passes>=1?this._score():this._rejected=!0}if(t&&e.clearsRack){const i=this.rooms.scriptedEnemies;i.filter(r=>!r.alive).length>=i.length&&i.length?this._score():this._rejected=!0}if(t&&e.shot){const i=e.shot({hits:this._hits});i==="score"?this._score():i==="reject"&&(this._rejected=!0)}if(t&&this._rejected){const i=this._wrongWay?e.facing:this._hits===0&&e.whiff?e.whiff:e.scold||"Not quite — go again";this._setStatus(i,"bad"),this._misses+=1,this._misses>=2&&e.nudge&&(this.hintEl.textContent=e.nudge)}this._rejected=!1,this._wrongWay=!1,this._homeBall(),this._reRack(),this._needsRoom&&this._buildRoom()}_detonate(e=[]){const t=e.find(i=>i)||this.rooms.scriptedEnemies.find(i=>i);for(const i of this.rooms.scriptedEnemies)i.alive&&this.game.forceKill(i);t&&(this.fx.shockwave(t.x,t.z,16727406,11,.55),this.fx.shockwave(t.x,t.z,16774872,6.5,.38),this.fx.shockwave(t.x,t.z,3076804,16,.7),this.fx.burst(t.x,t.z,44,16727406,19,1.6),this.fx.burst(t.x,t.z,26,16774872,26,1.1),this.fx.burst(t.x,t.z,16,3076804,13,1.8),this.fx.floatText?.(t.x,t.z,this.lesson?.cheer||"CLEARED","crit"),this.engine?.shake?.(20),this.engine?.zoomPunch?.(),this.game.audio?.roomClear?.())}_homeBall(){this.player.placeAt(0,this.spawnZ()),this.player.focus=this.player.focusMax,this._restAim()}_reRack(){if(this.rooms.scriptedEnemies.some(e=>!e.alive)){this.rooms.reRackScripted();return}for(const e of this.rooms.scriptedEnemies)!e.alive||!e.frozen||Math.abs(e.x-e.homeX)<.02&&Math.abs(e.z-e.homeZ)<.02||(e.x=e.homeX,e.z=e.homeZ,e.vx=0,e.vz=0,this.fx.burst(e.homeX,e.homeZ,6,9085112,4,.5))}_score(e=[]){const t=this.lesson;this.done+=1;for(const i of e)i&&i.alive&&this.game.forceKill(i);if(this.done>=t.goal){this._setStatus("",null),this._detonate(e),this._complete();return}this._setStatus(t.cheer||"Yes","good"),this._render()}_complete(){this._awaitingNext=!0,this._launched=!1,this.el.classList.add("done");const e=this.index+1>=As.length;e?(this.stepEl.textContent="Tutorial complete",this.sayEl.textContent="You know enough to play",this.hintEl.textContent="Next ones move — and they hit back.",this.countEl.hidden=!0):this._render(),this.skipEl.hidden=!0,this.nextEl.hidden=!1,this.nextEl.textContent=e?"Start playing →":"Next lesson →"}_advance(){if(this._awaitingNext=!1,this.nextEl.hidden=!0,this.index+1>=As.length){this._finish();return}this.skipEl.hidden=!1,this.el.classList.remove("done"),this._enter(this.index+1)}_render(){const e=this.lesson;if(e){if(this.stepEl.textContent=`Lesson ${this.index+1} of ${As.length}`,this.sayEl.innerHTML=e.say,this.hintEl.innerHTML=e.hint,e.showCount){this.countEl.hidden=!1,this.countEl.textContent="";for(let i=0;i<e.goal;i++){const s=document.createElement("span");s.className=i<this.done?"pip on":"pip",this.countEl.appendChild(s)}const t=document.createElement("span");t.className="tally",t.textContent=`${this.done} / ${e.goal}`,this.countEl.appendChild(t)}else this.countEl.hidden=!0;this.el.classList.add("show")}}_setStatus(e,t){if(this.statusEl.textContent=e,this.statusEl.classList.remove("good","bad"),!e){this.statusEl.classList.remove("show");return}t&&this.statusEl.classList.add(t),this.statusEl.classList.add("show")}dispose(){this.el.remove(),this.spotEl.remove(),this.ringEl.remove(),this.handEl.remove(),this.trackEl.remove()}}const tn=(n,e,t)=>Math.min(Math.max(n,e),t),us=document.getElementById("stage"),F0=document.getElementById("stage-canvas"),_s=document.getElementById("ui-layer"),Mh=document.getElementById("boot-veil");function Sh(){const n=window.innerWidth;let t=window.visualViewport?window.visualViewport.height:window.innerHeight,i=t*De.aspect;return i>n&&(i=n,t=i/De.aspect),us.style.width=`${Math.round(i)}px`,us.style.height=`${Math.round(t)}px`,{width:Math.round(i),height:Math.round(t)}}const ds=new n0({canvas:F0,antialias:!0,alpha:!1,powerPreference:"high-performance"});ds.setClearColor(ee.obsidian,1);ds.toneMapping=Li;const Di=new Fu;Di.background=new Ce(ee.obsidian);const Po=_n.viewHeight,Fc=Po*De.aspect,bi=new Hs(-Fc/2,Fc/2,Po/2,-Po/2,.1,400);bi.position.set(0,_n.cameraHeight,0);bi.up.set(0,0,-1);bi.lookAt(0,0,0);Di.add(bi);function O0(){return(navigator.hardwareConcurrency||4)>=_n.bloom.minHardwareConcurrency}let nn=null;function z0(n,e){O0()&&(nn=new c0(ds),nn.addPass(new h0(Di,bi)),nn.addPass(new hs(new Ue(n,e),_n.bloom.strength,_n.bloom.radius,_n.bloom.threshold)),nn.addPass(new d0))}function B0(n){const e=new ri;e.name="table";const t=new ke(new Un(De.width,De.height),new Bi({color:ee.felt,roughness:.95,metalness:0}));t.rotation.x=-Math.PI/2,t.position.y=-.02,e.add(t);const i=new ke(new Un(De.width*1.02,De.height*1.02),new mt({color:ee.feltDeep}));i.rotation.x=-Math.PI/2,i.position.y=-.06,e.add(i);const s=[],r=6,a=10;for(let h=1;h<r;h++){const p=-De.halfW+De.width*h/r;s.push(p,.01,-De.halfH,p,.01,De.halfH)}for(let h=1;h<a;h++){const p=-De.halfH+De.height*h/a;s.push(-De.halfW,.01,p,De.halfW,.01,p)}const o=new st;o.setAttribute("position",new at(s,3)),e.add(new Is(o,new Ri({color:ee.feltLine,transparent:!0,opacity:.28})));const l=De.railThickness,c=new Bi({color:ee.rail,roughness:.6,metalness:.35,emissive:new Ce(ee.railGlow),emissiveIntensity:.22}),u=[{w:De.width+l*2,d:l,x:0,z:-De.halfH-l/2},{w:De.width+l*2,d:l,x:0,z:De.halfH+l/2},{w:l,d:De.height,x:-De.halfW-l/2,z:0},{w:l,d:De.height,x:De.halfW+l/2,z:0}];for(const h of u){const p=new ke(new Pi(h.w,.9,h.d),c);p.position.set(h.x,.35,h.z),e.add(p)}const d=new Eo(new st().setFromPoints([new I(-De.halfW,.02,-De.halfH),new I(De.halfW,.02,-De.halfH),new I(De.halfW,.02,De.halfH),new I(-De.halfW,.02,De.halfH)]),new Ri({color:ee.railGlow,transparent:!0,opacity:.75}));return e.add(d),n.add(e),e}function k0(n){n.add(new id(2244941,.85));const e=new td(12578815,.8);e.position.set(6,24,-10),n.add(e);const t=new jl(ee.player,12,34,2);t.position.set(-7,9,12),n.add(t);const i=new jl(ee.solid,9,34,2);i.position.set(7,9,-12),n.add(i)}k0(Di);B0(Di);function G0(){const n=jt.particles.max,e=new Float32Array(n*3),t=new Float32Array(n*3),i=new st;i.setAttribute("position",new pt(e,3)),i.setAttribute("color",new pt(t,3));const s=new qu(i,new nh({size:.26,vertexColors:!0,transparent:!0,blending:_t,depthWrite:!1,sizeAttenuation:!0}));s.frustumCulled=!1,s.renderOrder=4,Di.add(s);const r=[];for(let E=0;E<n;E++)r.push({x:0,z:0,vx:0,vz:0,life:0,maxLife:1,r:0,g:0,b:0,drag:2.4}),e[E*3+1]=.45;let a=0;const o=10,l=[],c=new Wi(.86,1,40);for(let E=0;E<o;E++){const b=new mt({color:16777215,transparent:!0,opacity:0,blending:_t,depthWrite:!1,side:Bt}),P=new ke(c,b);P.rotation.x=-Math.PI/2,P.position.y=.09,P.visible=!1,P.renderOrder=4,Di.add(P),l.push({mesh:P,mat:b,life:0,maxLife:1,maxRadius:3})}let u=0;const d=14,h=new Float32Array(d*6),p=new Float32Array(d*6),_=new st;_.setAttribute("position",new pt(h,3)),_.setAttribute("color",new pt(p,3));const v=new Is(_,new Ri({vertexColors:!0,transparent:!0,blending:_t,depthWrite:!1}));v.frustumCulled=!1,v.renderOrder=4,Di.add(v);const m=[];for(let E=0;E<d;E++)m.push({life:0,maxLife:.2,r:0,g:0,b:0});let f=0;const T=[],R=new I,S=new Ce;return{burst(E,b,P,x,y,A=1){S.set(x);for(let C=0;C<P;C++){const L=r[a];a=(a+1)%n;const O=Math.random()*Math.PI*2,B=y*(.25+Math.random()*.95);L.x=E,L.z=b,L.vx=Math.cos(O)*B,L.vz=Math.sin(O)*B,L.maxLife=jt.particles.sparkLife*A*(.6+Math.random()*.8),L.life=L.maxLife,L.drag=2.4+Math.random()*2,L.r=S.r,L.g=S.g,L.b=S.b}},spray(E,b,P,x,y,A,C){S.set(x);const L=Math.atan2(C,A);for(let O=0;O<P;O++){const B=r[a];a=(a+1)%n;const F=L+(Math.random()-.5)*Math.PI,k=y*(.3+Math.random());B.x=E,B.z=b,B.vx=Math.cos(F)*k,B.vz=Math.sin(F)*k,B.maxLife=jt.particles.shatterLife*(.6+Math.random()*.8),B.life=B.maxLife,B.drag=1.6+Math.random()*1.6,B.r=S.r,B.g=S.g,B.b=S.b}},shockwave(E,b,P,x=3,y=.42){const A=l[u];u=(u+1)%o,A.mesh.position.set(E,.09,b),A.mat.color.set(P),A.life=y,A.maxLife=y,A.maxRadius=x,A.mesh.visible=!0},zap(E,b,P,x,y,A=.22){const C=m[f],L=f*6;f=(f+1)%d,h[L]=E,h[L+1]=.5,h[L+2]=b,h[L+3]=P,h[L+4]=.5,h[L+5]=x,S.set(y),C.r=S.r,C.g=S.g,C.b=S.b,C.life=A,C.maxLife=A,_.attributes.position.needsUpdate=!0},floatText(E,b,P,x=""){if(T.length>=16)return;const y=document.createElement("div");y.className=x?`float-text ${x}`:"float-text",y.textContent=P,_s.appendChild(y),T.push({el:y,x:E,z:b,life:jt.floatText.life,maxLife:jt.floatText.life})},clearTexts(){for(const E of T)E.el.remove();T.length=0},update(E,b){for(let y=0;y<n;y++){const A=r[y],C=y*3;if(A.life<=0){t[C]=0,t[C+1]=0,t[C+2]=0;continue}A.life-=E;const L=Math.exp(-A.drag*E);A.vx*=L,A.vz*=L,A.x+=A.vx*E,A.z+=A.vz*E;const O=Math.max(A.life/A.maxLife,0);e[C]=A.x,e[C+2]=A.z,t[C]=A.r*O,t[C+1]=A.g*O,t[C+2]=A.b*O}i.attributes.position.needsUpdate=!0,i.attributes.color.needsUpdate=!0;for(const y of l){if(y.life<=0){y.mesh.visible&&(y.mesh.visible=!1);continue}y.life-=E;const A=1-Math.max(y.life,0)/y.maxLife;y.mesh.scale.setScalar(.3+A*y.maxRadius),y.mat.opacity=(1-A)*.8,y.life<=0&&(y.mesh.visible=!1)}for(let y=0;y<d;y++){const A=m[y],C=y*6;if(A.life<=0){p[C]=0,p[C+1]=0,p[C+2]=0,p[C+3]=0,p[C+4]=0,p[C+5]=0;continue}A.life-=E;const L=Math.max(A.life/A.maxLife,0);p[C]=A.r*L,p[C+1]=A.g*L,p[C+2]=A.b*L,p[C+3]=p[C],p[C+4]=p[C+1],p[C+5]=p[C+2]}_.attributes.color.needsUpdate=!0;const P=us.clientWidth,x=us.clientHeight;for(let y=T.length-1;y>=0;y--){const A=T[y];if(A.life-=b,A.life<=0){A.el.remove(),T.splice(y,1);continue}const C=1-A.life/A.maxLife;R.set(A.x,.7,A.z).project(bi);const L=(R.x*.5+.5)*P,O=(-R.y*.5+.5)*x-C*jt.floatText.rise;A.el.style.transform=`translate(${L}px, ${O}px) translate(-50%, -50%) scale(${1+(1-C)*.25})`,A.el.style.opacity=String(Math.min(1,(1-C)*2.2))}}}}const H0=typeof window.matchMedia=="function"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches,We=new f0(bi,{reducedMotion:H0}),tl=new y0,ut=new m0,ue=new x0(Di),Ve=G0(),Rt=new L0(_s,{camera:bi,stage:us}),V0=new D0(_s),J={scene:Di,camera:bi,engine:We,physics:tl,audio:ut,player:ue,fx:Ve,hud:Rt,enemies:[],projectiles:[],zones:[],level:Qt.startRoom,running:!1,state:"playing",chain:{count:0,timer:0,best:0},launchHits:0,pyreBonus:0,hazardAccum:0,deathTimer:0,graceTimer:0,on:{}},Xt=new A0(J);J.boons=Xt;const kt=new C0(J,{onRoomClear:K0,onDoorEntered:J0,onWaveSpawned:({index:n,total:e})=>Rt.showBanner("Wave",`${n+1} of ${e}`,1.1)});J.rooms=kt;const ns={solid:ee.solid,stripe:ee.stripe,heavy:ee.heavy};function Oc(){const n=Math.min(J.chain.count,xn.multipliers.length-1),e=xn.multipliers[n];return J.chain.count+=1,J.chain.timer=xn.window,J.chain.best=Math.max(J.chain.best,J.chain.count),ut.chainNote(J.chain.count-1),e}function zc(n){const e=tn(n-1,0,xn.multipliers.length-1),t=xn.multipliers[e];return`${n} HITS  ×${t}`}let Nr=!1;const W0=(()=>{const t=(Gc.solid.hp/be.strikeDamage*be.referenceSpeed-be.launchSpeedMin)/(be.launchSpeedMax-be.launchSpeedMin);return tn(t,be.minPower,1)})();function yh(n){const e=(n?.power??0)>=W0;if(e&&!Nr){const t=ue;Ve.shockwave(t.aimCue.x,t.aimCue.z,ee.carom,3.4,.3),Ve.burst(t.aimCue.x,t.aimCue.z,14,ee.carom,13,.6),Ve.burst(t.x,t.z,10,ee.spark,9,.45),Ve.floatText(t.x,t.z+1.9,"MAX POWER","crit"),We.shake(5),ut.bumper?.()}Nr=e}function X0(){const n=tn(J.chain.count-1,0,xn.multipliers.length-1);return xn.multipliers[n]}function q0(n,e=.35,t=2.2){return tn(n/be.referenceSpeed,e,t)}function bh(n){ut.enemyDeath(),Ve.burst(n.x,n.z,20,ns[n.type],11,1.5),Ve.shockwave(n.x,n.z,ns[n.type],n.radius*4.5,.36),ue.addFocus(Si.onKill)}function Ds(n,e,t={}){if(!n||!n.alive)return{dealt:0,killed:!1};if(n.invulnerable)return{dealt:0,killed:!1,blocked:!0};const i=n.takeDamage(e,{...t,backstabBonus:ue.stats.backstabBonus});return!t.silent&&i.dealt>0&&Ve.burst(n.x,n.z,4,ns[n.type],5,.5),i.killed&&bh(n),i}J.dealDamage=Ds;J.forceKill=n=>{if(!n||!n.alive)return;n.state===Et.SPAWNING&&(n.state=Et.ACTIVE,n.spawnTimer=0),n.takeDamage(n.hp+1).killed&&bh(n)};J.tutorialGuard=null;function Y0(n){let e=be.strikeDamage*q0(n)*ue.stats.damageMult;return ue.bouncesUsed>0&&(e*=1+ue.stats.bankDamageBonus*ue.bouncesUsed),J.launchHits===0&&(e*=1+ue.stats.firstHitBonus),e*=1+J.pyreBonus,e}J.on={cueStrike({player:n,enemy:e,x:t,z:i,speed:s,banked:r}){Oc();const a=Ds(e,Y0(s),{fromX:n.x,fromZ:n.z,banked:r,source:"cue",silent:!0});return J.launchHits+=1,ss.notify("hit",{enemy:e,banked:r,index:J.launchHits,bounces:n.bouncesUsed,killed:!!a.killed}),J.launchHits>=2&&(Ve.floatText(n.x,n.z-2.4,zc(J.launchHits),"crit"),Ve.shockwave(t,i,ee.carom,5.5+J.launchHits*.6,.4),We.zoomPunch(),ut.chainNote(J.launchHits),n.addFocus(Do.praiseFocus)),We.hitStop(a.backstab?It.hitStopCrit:It.hitStop),We.shake(s*e.mass*.9),ut.impact(tn(s/be.launchSpeed,0,1)),Ve.burst(t,i,10,ns[e.type],s*.45),a.backstab?(ut.backstab(),We.zoomPunch(),Ve.floatText(t,i,"BACKSTAB","crit")):a.shielded&&Ve.floatText(t,i,"SHIELDED","block"),n.addFocus(Si.onChainHit),Xt.onImpact({player:n,enemy:e,x:t,z:i,speed:s,banked:r,result:a}),a},carom({striker:n,target:e,x:t,z:i,speed:s}){ss.notify("pass",{striker:n,target:e,x:t,z:i,speed:s}),Oc();const r=tn(s/be.referenceSpeed,.4,2),a=$e.caromDamage*r*ue.stats.damageMult;Ds(e,a,{fromX:n.x,fromZ:n.z,banked:!0,source:"carom",silent:!0}),Ds(n,a*.55,{source:"carom",silent:!0}),We.hitStop(It.hitStopCrit),We.shake(s*2.6),We.zoomPunch(),ut.carom(),Ve.floatText(t,i,zc(J.chain.count),"carom"),Ve.burst(t,i,24,ee.carom,s*.7,1.2),Ve.shockwave(t,i,ee.carom,4.2,.45),ue.addFocus(Si.onCarom),Xt.onImpact({player:ue,enemy:e,x:t,z:i,speed:s,banked:!0,result:null})},wallSplat({enemy:n,x:e,z:t,nx:i,nz:s,speed:r}){const a=tn(r/$e.wallSplatSpeed,1,2.4);Ds(n,$e.wallSplatDamage*a,{source:"splat",silent:!0}),We.hitStop(It.hitStopCrit),We.shake(r*2.1),We.zoomPunch(jt.zoomPunch*.7),ut.wallSplat(),Ve.floatText(e,t,"SPLAT!","splat"),Ve.spray(e,t,18,ns[n.type],r*.8,i,s),ue.addFocus(Si.onWallSplat)},enemyFired({x:n,z:e,dirX:t,dirZ:i}){Ve.burst(n,e,9,ee.projectile,9,.34),Ve.shockwave(n,e,ee.projectile,1.5,.16),Ve.burst(n+t*.5,e+i*.5,5,ee.spark,13,.22),We.shake(1.6)},enemyRebound({enemy:n,x:e,z:t,speed:i}){i<6||Ve.burst(e,t,3,ns[n.type],i*.25,.6)},playerRebound(n){const{player:e,x:t,z:i,speed:s,kind:r}=n;if(ut.rebound(tn(s/be.launchSpeed,0,1)),We.shake(s*.4),r==="bumper"){const a=Math.hypot(e.vx,e.vz)||1,l=Math.max(a*zt.bumper.boost,zt.bumper.minOut)/a;e.vx*=l,e.vz*=l,e.bouncesUsed=Math.max(0,e.bouncesUsed-1),e.addFocus(zt.bumper.focus),ut.bumper(),Ve.burst(t,i,12,ee.bumper,11,.8),Ve.shockwave(t,i,ee.bumper,2.6,.3)}else Ve.burst(t,i,5,ee.railGlow,s*.3,.6);Xt.onRebound(n)},playerLaunch(n){const e=n.power??1;ut.slingshot(e),Ve.burst(n.x,n.z,8+Math.round(e*16),ee.player,n.speed*.3,.7),Ve.shockwave(n.x,n.z,ee.player,1.8+e*3.4,.22+e*.16),We.shake(n.speed*e*1.3),e>.75&&(We.zoomPunch(),We.hitStop(It.hitStop*.7)),ss.notify("launch",{power:e,turned:J.lastTurn||0,dirX:n.dirX??0,dirZ:n.dirZ??0}),J.launchHits=0,J.pyreBonus=0,Xt.onLaunch(n)},playerDash(){ut.rebound(.4),J.launchHits=0,J.pyreBonus=0},playerTouched({player:n,enemy:e}){J.tutorialGuard||J.graceTimer>0||n.touchTimer>0||n.takeDamage(e.config.contactDamage,J,e)&&(n.touchTimer=be.touchInterval)},playerDamaged({player:n,amount:e}){ut.playerHurt(),We.shake(e*1.4),Rt.flashDamage(),Ve.floatText(n.x,n.z,`-${Math.round(e)}`,"splat")},playerDeath(){ut.playerDeath(),We.shake(24),We.zoomPunch(jt.zoomPunch*2),Ve.burst(ue.x,ue.z,40,ee.player,16,2),J.state="dead",J.deathTimer=2.4,Rt.showBanner("Run Over",`Reached room ${J.level} · best chain ${J.chain.best}`,2.4)},projectileHit({projectile:n,player:e}){if(Ve.burst(n.x,n.z,8,ee.projectile,7,.7),J.tutorialGuard){Rt.flashDamage(),We.shake(6);return}e.takeDamage(n.damage,J,n)},projectileExpired({projectile:n}){Ve.burst(n.x,n.z,4,ee.projectile,4,.5)},zoneEnter({zone:n,player:e}){if(n.kind!=="pyre"||e.pyreTimer>0||e.state!==it.LAUNCHED)return;const t=Math.hypot(e.vx,e.vz);if(t<1)return;const s=Math.min(t*zt.pyre.boost,zt.pyre.maxSpeed)/t;e.vx*=s,e.vz*=s,e.pyreTimer=zt.pyre.cooldown,J.pyreBonus=zt.pyre.damageBonus,ut.pyre(),Ve.shockwave(n.x,n.z,ee.pyre,4,.36),Ve.burst(n.x,n.z,14,ee.pyre,12,.9),Ve.floatText(n.x,n.z,"AMPLIFIED","crit")},hazardTick({player:n,dt:e}){if(!(n.invulnerable||!n.alive)&&(J.hazardAccum+=zt.hazard.dps*e,J.hazardAccum>=4)){const t=J.hazardAccum;J.hazardAccum=0,n.takeDamage(t,J,"hazard")}}};function $0(n){switch(n.reward.id){case"boon":return`${n.phase} boon`;case"repair":return`+${Qt.healAmount} hull`;case"focus":return`+${Qt.statRewards.focusMax.toFixed(1)}s focus`;case"power":return`+${Math.round(Qt.statRewards.damage*100)}% damage`;case"ricochet":return`+${Qt.statRewards.bounce} bounce`;default:return n.reward.label}}const Z0=n=>`#${n.toString(16).padStart(6,"0")}`;function K0(){J.state="cleared",ut.roomClear(),ue.addFocus(Si.onRoomClear),We.zoomPunch(jt.zoomPunch*1.4),Rt.showBanner("Room Clear","Shoot into an exit",2.4),Rt.setDoors(kt.doors.map(n=>({x:n.x,z:n.z+n.hh+1,text:$0(n),color:Z0(n.color)})))}function J0(n){if(ut.doorOpen(),Rt.setDoors([]),Ve.shockwave(n.x,n.z,n.color,6,.5),Ve.burst(n.x,n.z,22,n.color,12,1.2),n.reward.id==="boon"){Q0(n.phase);return}switch(n.reward.id){case"repair":ue.heal(Qt.healAmount),Rt.showBanner("Repaired",`+${Qt.healAmount} hull`,1.6);break;case"focus":Xt.addRunBonus({focusMax:Qt.statRewards.focusMax}),Rt.showBanner("Focus Up",`+${Qt.statRewards.focusMax.toFixed(1)}s bullet-time`,1.6);break;case"power":Xt.addRunBonus({damageMult:1+Qt.statRewards.damage}),Rt.showBanner("Power Up",`+${Math.round(Qt.statRewards.damage*100)}% damage`,1.6);break;case"ricochet":Xt.addRunBonus({maxBounces:Qt.statRewards.bounce}),Rt.showBanner("Ricochet",`+${Qt.statRewards.bounce} wall bounce`,1.6);break}Eh()}function Q0(n){J.state="modal",We.pause(),si.cancel(),ue.hideTrajectory();const e=Xt.rollOffer(fi.offerCount,kt.rng,n);V0.show(e,t=>{t&&(Xt.grant(t),ut.boonPick(),Rt.setBuild(Xt.owned)),We.resume(),Eh()},{level:J.level,phase:n})}function Eh(){J.level+=1,J.chain.count=0,J.chain.timer=0,J.launchHits=0,J.pyreBonus=0,J.hazardAccum=0,Xt.clearFields(),Ve.clearTexts(),Rt.setDoors([]),kt.generate(J.level),ue.placeAt(kt.layout.spawn.x,kr()),ue.addFocus(ue.focusMax),J.state="playing",si.setHeading(0,-1),Th()}function kr(){return De.halfH-De.height*be.spawnFromBottom}function Th(){const n=Do.lessons[J.level];n?Rt.showBanner(n.title,n.sub,2.6):Rt.showBanner(`Room ${J.level}`,kt.layout.name,1.5)}function wh(){Xt.reset(),Xt.recompute(),Rt.setBuild(Xt.owned),J.level=Qt.startRoom,J.chain.count=0,J.chain.timer=0,J.chain.best=0,J.launchHits=0,J.pyreBonus=0,J.hazardAccum=0,J.state="playing",J.graceTimer=0,Rt.setDoors([])}function Gr(){wh(),J.graceTimer=Do.graceSeconds,J.tutorialGuard=null,kt.runSeed=Math.random()*4294967295>>>0,kt.generate(J.level),ue.respawn(kt.layout.spawn.x,kr()),si.setHeading(0,-1),Th()}function Lo(){if(!ue.alive)return;const n=tl.predictTrajectory({x:ue.x,z:ue.z},ue.aimDir,{radius:ue.radius,maxBounces:Math.min(di.previewBounces,ue.maxBounces),bodies:J.enemies});ue.showTrajectory(n)}let Rs=null;const si=new p0(us,{camera:bi,isEnabled:()=>J.running&&ue.alive&&J.state!=="modal"&&!Vr,getAnchor:()=>({x:ue.x,z:ue.z}),onAimStart:()=>{const n=si.heading;Rs={x:n.x,z:n.z},J.lastTurn=0,ue.startAim()&&(We.setBulletTime(!0),ut.focusEnter())},onAimUpdate:n=>{yh(n),ue.updateAim(n),n.valid?Lo():ue.hideTrajectory()},onAimCancel:()=>{Nr=!1,We.inBulletTime&&ut.focusExit(),We.setBulletTime(!1),ue.cancelAim()},onRelease:n=>{if(Nr=!1,Rs){const e=tn(Rs.x*n.dirX+Rs.z*n.dirZ,-1,1);J.lastTurn=Math.acos(e)*180/Math.PI,Rs=null}We.inBulletTime&&ut.focusExit(),We.setBulletTime(!1),ue.launch(n,J)},onFlick:n=>{We.setBulletTime(!1),ue.cancelAim(),ue.dash(n.dirX,n.dirZ,J)}});function Hr(){const{width:n,height:e}=Sh(),t=Math.min(window.devicePixelRatio||1,_n.maxPixelRatio);ds.setPixelRatio(t),ds.setSize(n,e,!1),nn&&(nn.setPixelRatio(t),nn.setSize(n,e)),bi.updateProjectionMatrix()}const Bc=Sh();z0(Bc.width,Bc.height);Hr();window.addEventListener("resize",Hr);window.addEventListener("orientationchange",()=>setTimeout(Hr,120));window.visualViewport&&window.visualViewport.addEventListener("resize",Hr);const ss=new gs({layer:_s,game:J,player:ue,rooms:kt,input:si,fx:Ve,hud:Rt,engine:We,spawnZ:kr,resetRun:wh,finish:()=>Gr()}),il=document.getElementById("menu-main"),nl=document.getElementById("menu-settings"),yi=n=>document.getElementById(n);let Vr=!0,Cs=0,ki=!1;try{ki=localStorage.getItem("billiard-muted")==="1"}catch{}function Wr(){ut.setMuted(ki),yi("btn-mute").textContent=ki?"Sound off":"Sound on",yi("btn-mute").setAttribute("aria-pressed",String(ki)),yi("set-mute").textContent=ki?"Sound: Off":"Sound: On";try{localStorage.setItem("billiard-muted",ki?"1":"0")}catch{}}function sl(){yi("set-tutorial-state").textContent=gs.completed?"Tutorial finished — it will not show again":"Tutorial will play on your next run"}function j0(){Vr=!0,si.cancel(),ss.stop(),Mh.classList.remove("hidden"),_s.classList.add("attract"),il.hidden=!1,nl.hidden=!0,sl()}function e_(){Vr=!1,Mh.classList.add("hidden"),_s.classList.remove("attract"),ut.unlock(),Wr(),si.cancel(),gs.completed?Gr():ss.start()}yi("btn-play").addEventListener("click",e_);yi("btn-settings").addEventListener("click",()=>{il.hidden=!0,nl.hidden=!1,sl()});yi("set-back").addEventListener("click",()=>{nl.hidden=!0,il.hidden=!1});yi("btn-mute").addEventListener("click",()=>{ki=!ki,ut.unlock(),Wr()});yi("set-mute").addEventListener("click",()=>{ki=!ki,ut.unlock(),Wr()});yi("set-tutorial").addEventListener("click",()=>{gs.reset(),sl(),yi("set-tutorial").textContent="Tutorial reset",setTimeout(()=>{yi("set-tutorial").textContent="Replay tutorial"},1400)});function t_(n){if(!Vr)return;Cs-=n;const e=J.enemies.filter(l=>l.alive);if(e.length<=1){if(Cs>0)return;J.level=2+Math.floor(Math.random()*6),kt.generate(J.level),ue.placeAt(kt.layout.spawn.x,kr()),ue.hp=ue.maxHp,Rt.setDoors([]),Cs=.9;return}if(Cs>0||ue.state!==it.IDLE)return;const t=e[Math.floor(Math.random()*e.length)],i=t.x-ue.x,s=t.z-ue.z,r=Math.hypot(i,s)||1,a=i/r,o=s/r;si.setHeading(a,o),ue.launch({dirX:a,dirZ:o,power:.72+Math.random()*.28},J),Cs=1.15+Math.random()*.8}Wr();J.running=!0;Gr();j0();window.addEventListener("blur",()=>si.cancel());function i_(){for(let n=J.enemies.length-1;n>=0;n--){const e=J.enemies[n];e.alive||(e.dispose(),J.enemies.splice(n,1))}for(let n=J.projectiles.length-1;n>=0;n--){const e=J.projectiles[n];e.alive||(e.dispose(),J.projectiles.splice(n,1))}}function n_(n,e,t){ue.update(n,e,J,t),(ue.state===it.LAUNCHED||ue.state===it.DASHING)&&Xt.onTrajectory({player:ue,dt:n,game:J});for(const i of J.enemies)i.update(n,J);for(const i of J.projectiles)i.update(n);tl.update(n,J),Xt.update(n,J),i_(),J.graceTimer>0&&(J.graceTimer-=n),J.chain.timer>0&&(J.chain.timer-=n,J.chain.timer<=0&&(J.chain.count=0)),kt.update(n,J)}let kc=performance.now();function Ah(n){requestAnimationFrame(Ah);const e=(n-kc)/1e3;kc=n;const{dt:t,rawDt:i}=We.update(e);si.update(i),ut.setTimeDilation(We.timeScale),t_(i),ss.update(i);const s=si.isAiming&&ue.state===it.AIMING;if(s&&ue.focus<=0&&We.inBulletTime&&We.setBulletTime(!1),s&&!We.inBulletTime&&ue.focus>Si.minToAim&&We.setBulletTime(!0),J.running){if(J.state==="dead"?(J.deathTimer-=i,J.deathTimer<=0&&Gr()):t>0?n_(t,i,s&&We.inBulletTime):J.state!=="modal"&&ue.update(0,i,J,s&&We.inBulletTime),!s&&ue.state===it.LAUNCHED&&ue.speed>be.settleSpeed&&si.setHeading(ue.vx,ue.vz),s){const r=si.refresh();r&&(yh(r),ue.updateAim(r),r.valid?Lo():ue.hideTrajectory())}else if(J.state==="playing"&&ue.alive&&ue.state===it.IDLE){const r=si.heading;ue.aimDir.x=r.x,ue.aimDir.z=r.z,ue.aimPower=0,ue.aimCharge=0,ue.aimCue.x=ue.x-r.x*3.4,ue.aimCue.z=ue.z-r.z*3.4,Lo()}else ue.hideTrajectory();Rt.update({hp:ue.hp,maxHp:ue.maxHp,focus:ue.focus,focusMax:ue.focusMax,level:J.level,waveIndex:kt.waveIndex,waveCount:kt.cleared?0:kt.waves.length,layout:kt.layout?kt.layout.name:"",enemies:J.enemies.length,chain:J.chain.count,chainMult:X0(),chainTimer:J.chain.timer,chainWindow:xn.window},i)}Ve.update(t,i),nn?nn.render():ds.render(Di,bi)}requestAnimationFrame(Ah);
//# sourceMappingURL=main-CBycS6tc.js.map
