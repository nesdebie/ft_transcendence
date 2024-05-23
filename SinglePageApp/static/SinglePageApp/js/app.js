document.addEventListener("DOMContentLoaded", function() {
    const homeBtn = document.getElementById('homeBtn');
    const pongBtn = document.getElementById('pongBtn');
    const shiFuMiBtn = document.getElementById('shiFuMiBtn');
    const homeContent = document.getElementById('homeContent');
    const pongContent = document.getElementById('pongContent');
    const shiFuMiContent = document.getElementById('shiFuMiContent');
    
    function showContent(contentId) {
      homeContent.style.display = 'none';
      pongContent.style.display = 'none';
      shiFuMiContent.style.display = 'none';
      const content = document.getElementById(contentId);
      if (content) {
        content.style.display = 'block';
      } else {
        console.error(`No element found with id: ${contentId}`);
      }
    }
  
    function navigate(event) {
      event.preventDefault();
      const contentId = event.target.getAttribute('data-target');
      if (contentId) {
        history.pushState({ contentId }, '', `#${contentId}`);
        showContent(contentId);
      } else {
        console.error(`Button clicked without data-target: ${event.target}`);
      }
    }
  
    homeBtn.addEventListener('click', navigate);
    pongBtn.addEventListener('click', navigate);
    shiFuMiBtn.addEventListener('click', navigate);
  
    window.addEventListener('popstate', function(event) {
      if (event.state && event.state.contentId) {
        showContent(event.state.contentId);
      } else {
        showContent('homeContent');
      }
    });
  
    const initialContentId = location.hash ? location.hash.substring(1) : 'homeContent';
    showContent(initialContentId);
    if (!location.hash) {
      history.replaceState({ contentId: 'homeContent' }, '', '#homeContent');
    }
  });
  