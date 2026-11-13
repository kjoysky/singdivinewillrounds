/* Sing Divine Will Rounds - CD order page (PayPal checkout, card or PayPal) */
(function(){
  var PRICE=15.00, SHIP=6.50;
  var ITEMS={p1:{name:'Sing Divine Will Rounds - Playlist 1 (CD)',sku:'PX00ZV9WJD',qty:0},
             p2:{name:'Sing Divine Will Rounds - Playlist 2 (CD)',sku:'PX00Z59GIR',qty:0}};
  var STATES=[['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],['DC','District of Columbia'],['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['PR','Puerto Rico'],['RI','Rhode Island'],['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],['UT','Utah'],['VT','Vermont'],['VA','Virginia'],['WA','Washington'],['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming']];
  var COUNTIES='Aitkin,Anoka,Becker,Beltrami,Benton,Big Stone,Blue Earth,Brown,Carlton,Carver,Cass,Chippewa,Chisago,Clay,Clearwater,Cook,Cottonwood,Crow Wing,Dakota,Dodge,Douglas,Faribault,Fillmore,Freeborn,Goodhue,Grant,Hennepin,Houston,Hubbard,Isanti,Itasca,Jackson,Kanabec,Kandiyohi,Kittson,Koochiching,Lac qui Parle,Lake,Lake of the Woods,Le Sueur,Lincoln,Lyon,McLeod,Mahnomen,Marshall,Martin,Meeker,Mille Lacs,Morrison,Mower,Murray,Nicollet,Nobles,Norman,Olmsted,Otter Tail,Pennington,Pine,Pipestone,Polk,Pope,Ramsey,Red Lake,Redwood,Renville,Rice,Rock,Roseau,St. Louis,Scott,Sherburne,Sibley,Stearns,Steele,Stevens,Swift,Todd,Traverse,Wabasha,Wadena,Waseca,Washington,Watonwan,Wilkin,Winona,Wright,Yellow Medicine'.split(',');
  function $(id){return document.getElementById(id);}
  function norm(s){return (s||'').toLowerCase().replace(/\./g,'').replace(/\bsaint\b/g,'st').replace(/\s+/g,' ').trim();}
  function money(n){return '$'+n.toFixed(2);}
  var st=$('f-state'),co=$('f-county');
  STATES.forEach(function(s){var o=document.createElement('option');o.value=s[0];o.textContent=s[1];st.appendChild(o);});
  COUNTIES.forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c+' County';co.appendChild(o);});

  /* Minnesota rate: county list for the city -> city-only tax -> rest of county -> state */
  function mnRate(){
    var T=window.MN_TAX, city=norm($('f-city').value), cnty=norm(co.value), c=T.counties[cnty];
    if(c && c[city]!=null) return c[city];
    if(T.cities[city]!=null) return T.cities[city];
    if(c && c._rest!=null) return c._rest;
    return T.state;
  }
  function calc(){
    var n=ITEMS.p1.qty+ITEMS.p2.qty, items=n*PRICE, ship=n?SHIP:0, mn=st.value==='MN', rate=mn?mnRate():0;
    var tax=Math.round((items+ship)*rate)/100;   /* MN taxes shipping charges too */
    return {n:n,items:items,ship:ship,rate:rate,tax:tax,total:Math.round((items+ship+tax)*100)/100};
  }
  function fields(){return ['f-name','f-email','f-addr1','f-city','f-state','f-zip'].concat(st.value==='MN'?['f-county']:[]);}
  function problem(mark){
    var miss=[];
    fields().forEach(function(id){var el=$(id),v=el.value.trim(),ok=!!v;
      if(id==='f-email')ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if(id==='f-zip')ok=/^\d{5}(-?\d{4})?$/.test(v);
      if(mark)el.classList.toggle('bad',!ok); if(!ok)miss.push(el.closest('label').firstChild.textContent.trim());});
    if(!calc().n) return 'Please choose at least one CD (tap the + button).';
    if(miss.length) return 'Please fill in: '+miss.join(', ')+'.';
    return '';
  }
  var payActions=[];
  function refresh(){
    var c=calc();
    $('county-wrap').hidden=st.value!=='MN';
    $('s-count').textContent=c.n; $('s-items').textContent=money(c.items); $('s-ship').textContent=money(c.ship);
    $('tax-row').hidden=!(st.value==='MN'); $('s-rate').textContent=c.rate.toFixed(3).replace(/0+$/,'')+'%'; $('s-tax').textContent=money(c.tax);
    $('s-total').textContent=money(c.total);
    document.querySelectorAll('.pick').forEach(function(p){var q=ITEMS[p.dataset.id].qty;p.querySelector('.q-num').textContent=q;p.querySelector('.q-minus').disabled=!q;p.classList.toggle('on',q>0);});
    var msg=problem(false);
    $('pay-msg').textContent=msg||'All set! Choose how you would like to pay:';
    $('pay-buttons').classList.toggle('off',!!msg);
  }
  document.querySelectorAll('.pick').forEach(function(p){
    var it=ITEMS[p.dataset.id];
    p.querySelector('.q-plus').addEventListener('click',function(){if(it.qty<20)it.qty++;refresh();});
    p.querySelector('.q-minus').addEventListener('click',function(){if(it.qty>0)it.qty--;refresh();});
  });
  document.querySelectorAll('#orderForm input,#orderForm select').forEach(function(el){
    el.addEventListener('input',function(){el.classList.remove('bad');refresh();});
    el.addEventListener('change',refresh);
  });
  refresh();

  function order(){
    var c=calc(), units=[];
    ['p1','p2'].forEach(function(k){var it=ITEMS[k];if(it.qty)units.push({name:it.name,sku:it.sku,quantity:String(it.qty),category:'PHYSICAL_GOODS',unit_amount:{currency_code:'USD',value:PRICE.toFixed(2)}});});
    var note='P1 x'+ITEMS.p1.qty+', P2 x'+ITEMS.p2.qty+(st.value==='MN'?' | MN tax '+c.rate+'% ('+co.value+' Co, '+$('f-city').value.trim()+')':'');
    var addr={address_line_1:$('f-addr1').value.trim(),admin_area_2:$('f-city').value.trim(),admin_area_1:st.value,postal_code:$('f-zip').value.trim(),country_code:'US'};
    if($('f-addr2').value.trim())addr.address_line_2=$('f-addr2').value.trim();
    return {
      purchase_units:[{
        description:'Sing Divine Will Rounds CDs',
        custom_id:note.slice(0,127),
        items:units,
        amount:{currency_code:'USD',value:c.total.toFixed(2),breakdown:{
          item_total:{currency_code:'USD',value:c.items.toFixed(2)},
          shipping:{currency_code:'USD',value:c.ship.toFixed(2)},
          tax_total:{currency_code:'USD',value:c.tax.toFixed(2)}}},
        shipping:{name:{full_name:$('f-name').value.trim()},address:addr}
      }],
      payer:{email_address:$('f-email').value.trim()},
      application_context:{brand_name:'Sing Divine Will Rounds',shipping_preference:'SET_PROVIDED_ADDRESS',user_action:'PAY_NOW'}
    };
  }

  /* big thank-you box in the middle of the screen (can't be missed) */
  function showThanks(em,id){
    var o=document.createElement('div'); o.className='thanks-pop'; o.setAttribute('role','dialog'); o.setAttribute('aria-modal','true');
    o.innerHTML='<div class="thanks-card"><div class="tp-check">&#10003;</div><h3>Thank You!</h3><p><strong>Your order is complete and is being processed.</strong></p><p>A receipt was sent to <strong></strong>.</p><p>Your CDs will be made and mailed within a few days. They usually arrive in about a week.</p><p class="tp-id">Order number: <span></span></p><button type="button" class="btn btn-gold">OK</button></div>';
    o.querySelector('p:nth-of-type(2) strong').textContent=em; o.querySelector('.tp-id span').textContent=id;
    document.body.appendChild(o);
    var close=function(){o.remove();$('thanks').scrollIntoView({block:'center'});};
    o.querySelector('button').addEventListener('click',close);
    o.querySelector('button').focus();
  }
  function opts(src){return {
    fundingSource:src,
    style:{layout:'vertical',shape:'pill',height:52,label:'pay'},
    onClick:function(d,actions){var m=problem(true);if(m){$('pay-msg').textContent=m;$('pay-msg').scrollIntoView({behavior:'smooth',block:'center'});return actions.reject();}return actions.resolve();},
    createOrder:function(d,actions){return actions.order.create(order());},
    onApprove:function(d,actions){
      var wait=document.createElement('div'); wait.className='thanks-pop'; wait.innerHTML='<div class="thanks-card"><div class="tp-spin"></div><h3>Processing your payment&hellip;</h3><p>Please wait a moment.</p></div>'; document.body.appendChild(wait);
      return actions.order.capture().then(function(r){
      wait.remove();
      var em=$('f-email').value.trim(), id=r.id||d.orderID;
      $('t-email').textContent=em; $('t-id').textContent=id;
      $('orderForm').hidden=true; $('thanks').hidden=false;
      showThanks(em,id);
    }).catch(function(e){wait.remove();console.error(e);$('pay-msg').textContent='Sorry, the payment did not go through. Please try again, or email kjoysky31@gmail.com.';$('pay-msg').scrollIntoView({block:'center'});});},
    onError:function(e){console.error(e);$('pay-msg').textContent='Sorry, something went wrong with the payment. Nothing was charged. Please try again, or email kjoysky31@gmail.com.';}
  };}
  function render(){
    if(!window.paypal){$('pay-msg').textContent='The payment buttons did not load. Please refresh the page.';return;}
    [paypal.FUNDING.CARD,paypal.FUNDING.PAYPAL].forEach(function(f){var b=paypal.Buttons(opts(f));if(b.isEligible())b.render('#pay-buttons');});
  }
  if(document.readyState==='complete')render();else window.addEventListener('load',render);
})();
/* "Order Playlist 1/2" buttons: jump to the form and pick that CD */
document.querySelectorAll('a[data-cd]').forEach(function(a){a.addEventListener('click',function(){
  var p=document.querySelector('.pick[data-id="'+a.dataset.cd+'"]'),n=p&&p.querySelector('.q-num');
  if(n&&n.textContent==='0')p.querySelector('.q-plus').click();});});
