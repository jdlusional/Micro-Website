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
   Supports multiple newsletter checkboxes and an "All" option.
   ============================================================ */
(function(){
  var form=document.getElementById('signup-form');
  if(!form)return;

  var ENDPOINT='/api/subscribe';
  var status=document.getElementById('signup-status');
  var submit=document.getElementById('signup-submit');
  var group=document.getElementById('newsletter-group');
  var allBox=document.getElementById('newsletter-all');
  var emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // When "All" is checked, lock and disable the individual options.
  function syncAll(){
    if(!allBox||!group)return;
    var others=group.querySelectorAll('input[type=checkbox]:not(#newsletter-all)');
    for(var i=0;i<others.length;i++){
      if(allBox.checked){
        others[i].checked=false;
        others[i].disabled=true;
        others[i].closest('.checkbox-opt').classList.add('locked');
      }else{
        others[i].disabled=false;
        others[i].closest('.checkbox-opt').classList.remove('locked');
      }
    }
  }
  if(allBox)allBox.addEventListener('change',syncAll);

  function getNewsletters(){
    var boxes=group.querySelectorAll('input[type=checkbox]:checked');
    var vals=[];
    for(var i=0;i<boxes.length;i++)vals.push(boxes[i].value);
    return vals;
  }

  function setStatus(msg,kind){
    status.textContent=msg;
    status.className='form-status'+(kind?' '+kind:'');
  }
  function clearInvalid(){
    var f=form.querySelectorAll('.invalid');
    for(var i=0;i<f.length;i++)f[i].classList.remove('invalid');
    if(group)group.classList.remove('invalid');
  }
  function markInvalid(el){el.classList.add('invalid');}

  form.addEventListener('submit',function(e){
    e.preventDefault();
    clearInvalid();
    setStatus('','');

    var newsletters=getNewsletters();
    var data={
      newsletters:newsletters,
      first_name:form.first_name.value.trim(),
      last_name:form.last_name.value.trim(),
      email:form.email.value.trim(),
      organization:form.organization.value.trim(),
      referral:form.referral.value.trim(),
      company_website:form.company_website.value.trim()
    };

    var firstBad=null;
    if(newsletters.length===0){if(group)group.classList.add('invalid');firstBad=firstBad||group;}
    if(!data.first_name){markInvalid(form.first_name);firstBad=firstBad||form.first_name;}
    if(!data.last_name){markInvalid(form.last_name);firstBad=firstBad||form.last_name;}
    if(!emailRe.test(data.email)){markInvalid(form.email);firstBad=firstBad||form.email;}

    if(firstBad){
      setStatus('Please check the highlighted fields.','err');
      if(firstBad.focus)firstBad.focus();
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
        syncAll();
        setStatus('You are signed up. Thank you.','ok flash');
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

/* ============================================================
   CONTACT FORM
   Posts to a Cloudflare Pages Function at /api/contact.
   ============================================================ */
(function(){
  var form=document.getElementById('contact-form');
  if(!form)return;

  var ENDPOINT='/api/contact';
  var status=document.getElementById('contact-status');
  var submit=document.getElementById('contact-submit');
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
      first_name:form.first_name.value.trim(),
      last_name:form.last_name.value.trim(),
      email:form.email.value.trim(),
      phone:form.phone.value.trim(),
      location:form.location.value.trim(),
      purpose:form.purpose.value.trim(),
      urgency:form.urgency.value.trim(),
      referral:form.referral.value.trim(),
      company_website:form.company_website.value.trim()
    };

    var firstBad=null;
    if(!data.first_name){markInvalid(form.first_name);firstBad=firstBad||form.first_name;}
    if(!data.last_name){markInvalid(form.last_name);firstBad=firstBad||form.last_name;}
    if(!emailRe.test(data.email)){markInvalid(form.email);firstBad=firstBad||form.email;}
    if(!data.location){markInvalid(form.location);firstBad=firstBad||form.location;}
    if(!data.purpose){markInvalid(form.purpose);firstBad=firstBad||form.purpose;}
    if(!data.urgency){markInvalid(form.urgency);firstBad=firstBad||form.urgency;}
    if(!data.referral){markInvalid(form.referral);firstBad=firstBad||form.referral;}

    if(firstBad){
      setStatus('Please check the highlighted fields.','err');
      if(firstBad.focus)firstBad.focus();
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
        setStatus('Your message has been sent. Thank you.','ok flash');
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
