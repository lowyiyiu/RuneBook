<changelog-modal>
  
  <div class="ui small modal changelog-modal">
    <i class="close icon"></i>
    <div class="header">
      <i1-8n>whatsnew.title</i1-8n> { require('electron-is-dev') === true ? "DEV" : require('electron').remote.app.getVersion(); }
    </div>
    <div class="scrolling content">
      <img class="ui fluid rounded image" src="./img/backdrop.png">
      <h3>Greetings, Summoner!</h3>
      <p>
        <ul>
        <li>Update source to fetch ddragon API version</li>
        <li>Added a new page from OP.GG for URF</li>
        <li>Update U.GG</li>
        <li>Removed KoreanBuilds</li>
        </ul>
      </p>
    </div>
  </div>

  <script>
    
    this.on('mount', () => {
      $('.changelog-modal').modal({
        duration: 200,
        autofocus: false,
      });

      freezer.emit("changelog:ready");
    });

  </script>

</changelog-modal>