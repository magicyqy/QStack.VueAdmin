tinymce.PluginManager.add('filebrowser', function (editor, url) {
  // Add a button that opens a window
  editor.ui.registry.addButton('filebrowser', {
    text: '文件浏览器',
    icon: 'filebrowser',
    tooltip: '资源浏览器',
    onAction: function () {
     
      editor.fileBrowser()
    }
  });
  editor.ui.registry.getAll().icons.filebrowser || editor.ui.registry.addIcon('filebrowser', '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M1024 276c-3.2-55.2-40.8-96.8-91.2-104.8v-1.6H512.8c-38.4 0-57.6-20-79.2-42.4-23.2-24-49.6-52-100-52H108.8C48.8 76 0 126.4 0 187.2v648.8c0 61.6 48.8 111.2 108.8 111.2h807.2c60 0 108.8-49.6 108.8-111.2V277.6l-0.8-1.6z m-79.2 158.4v396.8c0 15.2-12 30.4-28.8 30.4H108.8c-14.4 0-29.6-12-29.6-30.4V434.4h865.6z m0.8-152.8v72H79.2V187.2c0-15.2 12-30.4 29.6-30.4h224.8c22.4 0 34.4 12 54.4 33.6 24.8 27.2 56 60.8 124.8 60.8h404c13.6 0 28.8 12 28.8 30.4z" fill="#2c2c2c" p-id="3543"></path></svg>');
  return {
    getMetadata: function () {
      return {
        name: "file browser",
        url: "http://exampleplugindocsurl.com"
      };
    }
  };
});
