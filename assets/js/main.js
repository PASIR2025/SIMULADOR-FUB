(function(){
  function onViewportChange(){
    try {
      if (typeof updateTransform === 'function') updateTransform();
      if (typeof updateConnections === 'function') updateConnections();
    } catch(e){ /* noop */ }
  }
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('orientationchange', onViewportChange);
  if (window.visualViewport){
    visualViewport.addEventListener('resize', onViewportChange);
    visualViewport.addEventListener('scroll', onViewportChange);
  }
})();