import{R as d,j as e,H as Y,C as L,V as l,B as t,b as g,T as i,a as j}from"./index-CvJuAqlI.js";import{B as $}from"./badge-CLxrEsJb.js";import{T as N}from"./textarea-C-Pgyo0B.js";import{B as a}from"./button-B3PPmdh2.js";import{C as A}from"./center-BWHoe4bE.js";import"./factory-BjYzDWsz.js";import"./attr-C3Jtgmrz.js";const _=()=>e.jsxs(t,{position:"relative",w:"full",maxW:"400px",mx:"auto",children:[e.jsx(A,{children:e.jsxs(l,{gap:4,children:[e.jsxs(t,{animation:"scaleIn 0.8s ease-out 0.2s both",transformOrigin:"center",children:[e.jsx(g,{size:"4xl",fontWeight:"bold",bgGradient:"linear(to-r, blue.400, purple.500, pink.500)",bgClip:"text",textAlign:"center",fontFamily:"mono",children:"🚀"}),e.jsx(g,{size:"2xl",fontWeight:"bold",bgGradient:"linear(to-r, blue.400, purple.500, pink.500)",bgClip:"text",textAlign:"center",mt:2,children:"Lost in Space"})]}),e.jsxs(t,{position:"relative",w:"200px",h:"100px",children:[e.jsx(t,{position:"absolute",top:"20px",left:"20px",w:"20px",h:"20px",bg:"blue.300",borderRadius:"50%",animation:"fadeInFloat 0.6s ease-out 0.5s both, float 3s ease-in-out infinite 1s"}),e.jsx(t,{position:"absolute",top:"40px",right:"30px",w:"15px",h:"15px",bg:"purple.300",borderRadius:"50%",animation:"fadeInFloat 0.6s ease-out 0.7s both, float 3s ease-in-out infinite 2s"}),e.jsx(t,{position:"absolute",bottom:"20px",left:"50px",w:"12px",h:"12px",bg:"pink.300",borderRadius:"50%",animation:"fadeInFloat 0.6s ease-out 0.9s both, float 3s ease-in-out infinite 3s"})]})]})}),e.jsx("style",{children:`
					@keyframes scaleIn {
						0% {
							opacity: 0;
							transform: scale(0.8);
						}
						100% {
							opacity: 1;
							transform: scale(1);
						}
					}
					@keyframes fadeInFloat {
						0% {
							opacity: 0;
							transform: translateY(20px);
						}
						100% {
							opacity: 1;
							transform: translateY(0);
						}
					}
					@keyframes fadeInUp {
						0% {
							opacity: 0;
							transform: translateY(30px);
						}
						100% {
							opacity: 1;
							transform: translateY(0);
						}
					}
					@keyframes float {
						0%, 100% { transform: translateY(0px); }
						50% { transform: translateY(-20px); }
					}
				`})]}),y=[{title:"🐛 Debug Challenge",problem:"Find the bug in this function:",code:`function findSum(arr) {
  let sum = 0;
  for (let i = 0; i <= arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}`,hint:"What happens when i equals arr.length?",solution:"Change i <= arr.length to i < arr.length",explanation:"The bug is an off-by-one error. When i equals arr.length, arr[i] is undefined, causing NaN in the sum."},{title:"🧮 Algorithm Puzzle",problem:"What's the time complexity of this function?",code:`function mystery(n) {
  if (n <= 1) return n;
  return mystery(n-1) + mystery(n-2);
}`,hint:"This is a famous sequence...",solution:"O(2^n) - Fibonacci with exponential time complexity",explanation:"This is the Fibonacci function. Each call makes two recursive calls, leading to exponential growth."},{title:"🔍 Logic Riddle",problem:"What will this code output?",code:"console.log(0.1 + 0.2 === 0.3);",hint:"Think about floating point precision...",solution:"false",explanation:"Due to floating point precision, 0.1 + 0.2 equals 0.30000000000000004, not exactly 0.3."},{title:"🎯 JavaScript Quirk",problem:"What's the result of this expression?",code:"[] + [] + 'foo'.split('')",hint:"What happens when you add arrays?",solution:"'f,o,o'",explanation:"Arrays convert to strings when added, so [] + [] = '' and 'foo'.split('') = ['f','o','o'] which becomes 'f,o,o'."},{title:"⚡ Performance Challenge",problem:"How would you optimize this function?",code:`function isPrime(n) {
  for (let i = 2; i < n; i++) {
    if (n % i === 0) return false;
  }
  return n > 1;
}`,hint:"You don't need to check all numbers up to n...",solution:"Check only up to Math.sqrt(n)",explanation:"If n has a factor greater than √n, it must also have a factor less than √n. So we only need to check up to √n."}],v=["Oops! This page went on a coffee break ☕","Looks like you've wandered into the digital void 🚀","This page is playing hide and seek... and winning! 🎯","The page you're looking for has been abducted by aliens 👽","This page decided to take a vacation to the Bahamas 🏝️","Lost in space, but we found this cool message instead! 🎉","This page is currently attending a virtual conference 📹","The page you seek has been moved to a parallel universe 🌌","Houston, we have a problem... this page is missing! 🛸","This page has gone where no page has gone before! 🌟"],D=function(){const[S,z]=d.useState(0),[p,w]=d.useState(!1),[h,C]=d.useState(!1),[n,b]=d.useState(""),[r,u]=d.useState(""),R=v[Math.floor(Math.random()*v.length)],s=y[S],T=()=>{z(o=>(o+1)%y.length),w(!1),C(!1),b(""),u("")},F=()=>w(!p),H=()=>C(!h),W=()=>{try{const o=[{input:[1,2,3,4,5],expected:15},{input:[10,20,30],expected:60},{input:[],expected:0},{input:[5],expected:5}];let k=0;const x=[];for(const c of o)try{const m=new Function("arr",`return (${n})(arr)`)(c.input);m===c.expected?(k++,x.push(`✅ Test passed: [${c.input.join(", ")}] → ${m}`)):x.push(`❌ Test failed: [${c.input.join(", ")}] → ${m} (expected ${c.expected})`)}catch(f){x.push(`❌ Error: ${f instanceof Error?f.message:String(f)}`)}const I=x.join(`
`)+`

🎯 Result: ${k}/${o.length} tests passed`;u(I)}catch(o){u(`❌ Error: ${o instanceof Error?o.message:String(o)}`)}};return e.jsxs(e.Fragment,{children:[e.jsxs(Y,{children:[e.jsx("title",{children:"Lost in Space | Nick Karnik"}),e.jsx("meta",{name:"description",content:"Looks like you've wandered into the digital void! Let's get you back on track."}),e.jsx("meta",{name:"robots",content:"noindex, nofollow"})]}),e.jsx(L,{maxW:"4xl",py:6,children:e.jsxs(l,{gap:4,align:"center",children:[e.jsx(_,{}),e.jsxs(l,{gap:3,textAlign:"center",maxW:"2xl",children:[e.jsx(t,{animation:"fadeInUp 0.6s ease-out 0.3s both",children:e.jsx(g,{size:"xl",color:"gray.600",textAlign:"center",children:R})}),e.jsx(t,{animation:"fadeInUp 0.6s ease-out 0.5s both",children:e.jsx(i,{fontSize:"lg",color:"gray.500",lineHeight:"tall",children:"While you're here, why not solve a quick coding challenge? It's more fun than staring at a blank page! 🧠"})}),e.jsx(t,{animation:"fadeInUp 0.6s ease-out 0.7s both",w:"full",maxW:"4xl",bg:"white",p:4,borderRadius:"lg",border:"1px solid",borderColor:"gray.200",boxShadow:"0 4px 20px rgba(0, 0, 0, 0.1)",children:e.jsxs(l,{gap:2,align:"stretch",children:[e.jsxs(j,{justify:"space-between",align:"center",children:[e.jsx(g,{size:"md",color:"purple.600",children:s.title}),e.jsxs($,{colorScheme:"purple",variant:"subtle",children:[S+1," of ",y.length]})]}),e.jsx(i,{fontSize:"md",color:"gray.700",textAlign:"left",children:s.problem}),e.jsx(t,{bg:"#1a1a1a",color:"#00ff00",p:4,borderRadius:"8px",fontFamily:"'Courier New', monospace",fontSize:"14px",overflowX:"auto",border:"1px solid #333",children:e.jsx("pre",{style:{margin:0,whiteSpace:"pre",lineHeight:"1.5"},children:s.code})}),e.jsx(t,{bg:"#f8f9fa",p:3,borderRadius:"8px",border:"1px solid #e9ecef",borderLeft:"4px solid #8b5cf6",children:e.jsxs(l,{gap:2,align:"stretch",children:[e.jsx(i,{fontSize:"sm",fontWeight:"semibold",color:"gray.700",children:"💻 Your Solution:"}),e.jsx(N,{value:n,onChange:o=>b(o.target.value),placeholder:"Write your solution here... (e.g., function findSum(arr) { ... })",fontFamily:"'Courier New', monospace",fontSize:"14px",minH:"60px",bg:"white",border:"1px solid #ddd",borderRadius:"4px",p:2,resize:"vertical",borderColor:n&&r&&r.includes("❌")?"#ef4444":"#ddd",_focus:{borderColor:"#8b5cf6",boxShadow:"0 0 0 2px rgba(139, 92, 246, 0.2)"},_hover:{borderColor:"#8b5cf6"},title:"Write your JavaScript function here. Make sure to include proper syntax!"}),e.jsxs(j,{gap:2,children:[e.jsx(a,{bg:"#8b5cf6",color:"white",border:"none",px:4,py:2,borderRadius:"4px",cursor:"pointer",fontSize:"14px",onClick:W,disabled:!n.trim(),_hover:{bg:n.trim()?"#7c3aed":"#8b5cf6",transform:n.trim()?"translateY(-1px)":"none",boxShadow:n.trim()?"0 4px 12px rgba(139, 92, 246, 0.3)":"none"},_disabled:{bg:"#9ca3af",cursor:"not-allowed"},title:n.trim()?"Run your code against test cases":"Write some code first!",children:"🧪 Test Solution"}),e.jsx(a,{bg:"transparent",color:"#6b7280",border:"1px solid #d1d5db",px:4,py:2,borderRadius:"4px",cursor:"pointer",fontSize:"14px",onClick:()=>{b(""),u("")},_hover:{bg:"#f9fafb",borderColor:"#9ca3af",transform:"translateY(-1px)",boxShadow:"0 4px 12px rgba(0, 0, 0, 0.1)"},title:"Clear your current solution and start over",children:"🗑️ Clear"})]})]})}),r&&e.jsx(t,{bg:r.includes("✅")?"#d1fae5":"#fee2e2",p:2,borderRadius:"4px",border:"1px solid",borderColor:r.includes("✅")?"#10b981":"#ef4444",fontFamily:"'Courier New', monospace",fontSize:"11px",whiteSpace:"pre-wrap",color:r.includes("✅")?"#065f46":"#991b1b",children:r}),e.jsxs(j,{gap:1,justify:"center",flexWrap:"wrap",children:[e.jsxs(a,{size:"sm",variant:"outline",colorScheme:"blue",onClick:F,_hover:{transform:"translateY(-1px)",boxShadow:"0 4px 12px rgba(59, 130, 246, 0.2)"},title:p?"Hide the hint":"Get a helpful hint to solve this challenge",children:[p?"Hide":"Show"," Hint"]}),e.jsxs(a,{size:"sm",variant:"outline",colorScheme:"green",onClick:H,_hover:{transform:"translateY(-1px)",boxShadow:"0 4px 12px rgba(34, 197, 94, 0.2)"},title:h?"Hide the solution":"Reveal the complete solution and explanation",children:[h?"Hide":"Show"," Solution"]}),e.jsx(a,{size:"sm",colorScheme:"purple",onClick:T,_hover:{transform:"translateY(-1px)",boxShadow:"0 4px 12px rgba(147, 51, 234, 0.3)"},title:"Move to the next coding challenge",children:"Next Challenge →"})]}),p&&e.jsx(t,{bg:"blue.50",p:2,borderRadius:"md",borderLeft:"4px solid",borderLeftColor:"blue.400",children:e.jsxs(i,{fontSize:"sm",color:"blue.700",children:["💡 ",e.jsx("strong",{children:"Hint:"})," ",s.hint]})}),h&&e.jsx(t,{bg:"green.50",p:2,borderRadius:"md",borderLeft:"4px solid",borderLeftColor:"green.400",children:e.jsxs(l,{gap:1,align:"stretch",children:[e.jsxs(i,{fontSize:"sm",color:"green.700",children:["✅ ",e.jsx("strong",{children:"Solution:"})," ",s.solution]}),e.jsx(i,{fontSize:"sm",color:"green.600",children:s.explanation})]})})]})}),e.jsx(t,{animation:"fadeInUp 0.6s ease-out 0.9s both",children:e.jsxs(i,{fontSize:"md",color:"gray.500",textAlign:"center",children:["Ready to get back on track?",e.jsx(a,{variant:"outline",colorScheme:"purple",ml:1,onClick:()=>window.location.href="/",children:"Click here"})]})})]})]})})]})};export{D as component};
