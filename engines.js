export const engines = [
  ["chat","Metin & Sohbet","chat"],["reasoning","Akıl Yürütme","brain"],["turkish","Türkçe Dil","language"],["english","İngilizce Dil","language"],["research","Araştırma","search"],
  ["image","Görsel Üretim","image"],["image_edit","Görsel Düzenleme","edit"],["vision","Görsel Analiz","scan"],["video","Video Üretim","video"],["video_edit","Video Düzenleme","film"],
  ["coding","Kod Yazma","code"],["debugging","Hata Ayıklama","bug"],["app_builder","Uygulama Geliştirme","app"],["web_builder","Web Sitesi Oluşturma","web"],["prompt","Prompt Hazırlama","wand"],
  ["speech","Ses Tanıma","mic"],["tts","Metin Seslendirme","voice"],["audio","Ses Üretimi","audio"],["documents","Belge Analizi","file"],["automation","Otomasyon","workflow"]
].map(([id,name,icon],i)=>({id,name,icon,number:i+1}));
