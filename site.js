document.documentElement.classList.add('snap');
document.addEventListener('click',function(e){
  var t=e.target.closest('.nav-toggle');
  if(t){var r=document.querySelector('.nav-right');if(r)r.classList.toggle('open');return;}
  var c=e.target.closest('.chevron');
  if(c){
    var panels=Array.prototype.slice.call(document.querySelectorAll('.panel,.footer-panel'));
    var cur=c.closest('.panel');
    var i=panels.indexOf(cur);
    if(i>-1&&i<panels.length-1){panels[i+1].scrollIntoView({behavior:'smooth',block:'start'});}
  }
});
document.addEventListener('DOMContentLoaded',function(){
  var y=document.getElementById('yr');if(y)y.textContent=new Date().getFullYear();
});

/* ============================================================
   NEWSLETTER SIGNUP FORM
   Posts to a Cloudflare Pages Function at /api/subscribe.
   ============================================================ */
(function(){
  var form=document.getElementById('signup-form');
  if(!form)return;

  var ENDPOINT='/api/subscribe';
  var status=document.getElementById('signup-status');
  var submit=document.getElementById('signup-submit');
  var emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setStatus(msg,kind){
    status.textContent=msg;
    status.className='form-status'+(kind?' '+kind:'');
  }
  function clearInvalid(){
    var f=form.querySelectorAll('.invalid');
    for(var i=0;i<f.length;i++)f[i].classList.remove('invalid');
  }
  function markInvalid(el){el.classList.add('invalid');}

  form.addEventListener('submit',function(e){
    e.preventDefault();
    clearInvalid();
    setStatus('','');

    var data={
      newsletter:form.newsletter.value.trim(),
      first_name:form.first_name.value.trim(),
      last_name:form.last_name.value.trim(),
      email:form.email.value.trim(),
      organization:form.organization.value.trim(),
      referral:form.referral.value.trim(),
      company_website:form.company_website.value.trim()
    };

    var firstBad=null;
    if(!data.newsletter){markInvalid(form.newsletter);firstBad=firstBad||form.newsletter;}
    if(!data.first_name){markInvalid(form.first_name);firstBad=firstBad||form.first_name;}
    if(!data.last_name){markInvalid(form.last_name);firstBad=firstBad||form.last_name;}
    if(!emailRe.test(data.email)){markInvalid(form.email);firstBad=firstBad||form.email;}

    if(firstBad){
      setStatus('Please check the highlighted fields.','err');
      firstBad.focus();
      return;
    }

    submit.disabled=true;
    var original=submit.textContent;
    submit.textContent='Sending...';

    fetch(ENDPOINT,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    }).then(function(r){
      return r.json().catch(function(){return {};}).then(function(body){
        return {ok:r.ok,body:body};
      });
    }).then(function(res){
      if(res.ok){
        form.reset();
        setStatus('You are signed up. Thank you.','ok');
      }else{
        setStatus((res.body&&res.body.error)||'Something went wrong. Please try again.','err');
      }
    }).catch(function(){
      setStatus('Could not reach the server. Please try again.','err');
    }).then(function(){
      submit.disabled=false;
      submit.textContent=original;
    });
  });
})();
