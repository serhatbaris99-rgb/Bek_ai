import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import fs from "node:fs/promises";
import path from "node:path";
import { engines } from "./engines.js";

const app=express(), PORT=Number(process.env.PORT||8787);
const DATA=path.resolve("data");
await fs.mkdir(DATA,{recursive:true});
app.use(helmet({contentSecurityPolicy:false}));
app.use(express.json({limit:"15mb"}));
app.use(cookieParser());

function auth(req,res,next){
  try{
    const token=req.cookies.bek_session;
    if(!token) throw new Error("missing");
    jwt.verify(token,process.env.JWT_SECRET);
    next();
  }catch{return res.status(401).json({error:"Oturum gerekli."});}
}
app.get("/api/health",(_req,res)=>res.json({
  ok:true,app:"BEK AI",version:"1.0.0",
  chat:!!process.env.OPENROUTER_API_KEY,
  image:!!(process.env.IMAGE_API_BASE_URL&&process.env.IMAGE_API_KEY),
  video:!!process.env.VIDEO_PROVIDER
}));
app.post("/api/login",(req,res)=>{
  if(!process.env.BEK_ADMIN_PASSWORD||!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32)
    return res.status(503).json({error:"Önce .env güvenlik ayarları yapılmalı."});
  if(String(req.body?.password||"")!==process.env.BEK_ADMIN_PASSWORD)
    return res.status(401).json({error:"Şifre yanlış."});
  const token=jwt.sign({owner:true},process.env.JWT_SECRET,{expiresIn:"7d"});
  res.cookie("bek_session",token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",maxAge:604800000}).json({ok:true});
});
app.post("/api/logout",(_req,res)=>res.clearCookie("bek_session").json({ok:true}));
app.get("/api/engines",auth,(_req,res)=>res.json({engines:engines.map(e=>({...e,status:
  e.id==="chat"?(process.env.OPENROUTER_API_KEY?"Hazır":"Anahtar bekliyor"):
  e.id==="image"?(process.env.IMAGE_API_KEY?"Hazır":"Servis bekliyor"):
  e.id==="video"?(process.env.VIDEO_PROVIDER?"Sağlayıcı tanımlı":"Servis bekliyor"):"Model eşleştirmesi bekliyor"}))}));
function modelFor(task){
  let routes={};try{routes=JSON.parse(process.env.MODEL_ROUTES||"{}")}catch{}
  return routes[task]||process.env.OPENROUTER_MODEL||"meta-llama/llama-3.3-70b-instruct:free";
}
app.post("/api/chat",auth,async(req,res)=>{
  const messages=req.body?.messages, task=String(req.body?.task||"chat");
  if(!Array.isArray(messages)||!messages.length||messages.length>40)return res.status(400).json({error:"Mesaj geçmişi geçersiz."});
  if(!process.env.OPENROUTER_API_KEY)return res.status(503).json({error:"Sohbet için OPENROUTER_API_KEY eklenmeli."});
  try{
    const client=new OpenAI({apiKey:process.env.OPENROUTER_API_KEY,baseURL:"https://openrouter.ai/api/v1"});
    const safe=messages.map(m=>({role:["user","assistant","system"].includes(m.role)?m.role:"user",content:String(m.content||"").slice(0,18000)}));
    const out=await client.chat.completions.create({model:modelFor(task),messages:safe,temperature:.7});
    res.json({text:out.choices?.[0]?.message?.content||"",model:out.model});
  }catch(e){console.error(e.message);res.status(502).json({error:"AI sağlayıcısı yanıt vermedi; model kotasını ve anahtarı kontrol et."});}
});
app.get("/api/memory",auth,async(_req,res)=>{
  try{res.json({items:JSON.parse(await fs.readFile(path.join(DATA,"memory.json"),"utf8"))})}
  catch{res.json({items:[]})}
});
app.post("/api/memory",auth,async(req,res)=>{
  const text=String(req.body?.text||"").trim().slice(0,2000);
  if(!text)return res.status(400).json({error:"Not boş olamaz."});
  let items=[];try{items=JSON.parse(await fs.readFile(path.join(DATA,"memory.json"),"utf8"))}catch{}
  items.unshift({id:Date.now(),text,createdAt:new Date().toISOString()});
  await fs.writeFile(path.join(DATA,"memory.json"),JSON.stringify(items.slice(0,500),null,2));
  res.json({ok:true,items:items.slice(0,500)});
});
app.post("/api/image",auth,async(req,res)=>{
  const prompt=String(req.body?.prompt||"").slice(0,4000);
  if(!prompt)return res.status(400).json({error:"Görsel promptu gerekli."});
  if(!process.env.IMAGE_API_BASE_URL||!process.env.IMAGE_API_KEY)return res.status(503).json({error:"Görsel servisi henüz bağlanmadı. .env ayarları gerekli."});
  try{
    const r=await fetch(process.env.IMAGE_API_BASE_URL,{method:"POST",headers:{"Authorization":`Bearer ${process.env.IMAGE_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.IMAGE_MODEL,prompt,n:1,size:"1024x1024"})});
    const d=await r.json();if(!r.ok)return res.status(502).json({error:d.error?.message||"Görsel servisi hata verdi."});
    res.json({data:d.data||d});
  }catch{return res.status(502).json({error:"Görsel servisine ulaşılamadı."});}
});
app.post("/api/video",auth,(_req,res)=>res.status(503).json({error:"Video üretimi için bir sağlayıcı seçilip o servisin API akışı bağlanmalı."}));
app.use(express.static("public"));
app.get("*",(_req,res)=>res.sendFile(path.resolve("public/index.html")));
app.listen(PORT,()=>console.log(`BEK AI hazır: http://localhost:${PORT}`));
