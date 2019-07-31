CKEDITOR.plugins.add('simage', {
  icons: 'simage',
  init: function (editor) {
    editor.addCommand('simage', {
      allowedContent: 'img[!src,alt,width,height,class,data-width,data-height]',
      exec: function () {
        var fileInput = document.createElement('input');

        fileInput.setAttribute('type', 'file');
        fileInput.setAttribute('accept', '.jpg,.jpeg,.png,.tif,.gif,.svg');
        fileInput.click();

        fileInput.onchange = function () {
          var file = fileInput.files[0],
            img, inputWidth, inputHeight, formData, loadMaskEl,
            imgSrc, imgContainerEl, imgHtml, srcSet;

          if (file.size > 5000000) {
            editor.showNotification('Dosya boyutu izin verilen sınırı aşıyor. Lütfen en fazla 5 MB büyüklüğünde bir dosya seçin.', 'warning');
            return;
          } else if (['jpeg', 'jpg', 'png', 'svg', 'gif', 'tif', 'svg+xml'].indexOf(file.type.split('/')[1]) === -1) {
            editor.showNotification('Seçmiş olduğunuz dosya bir resim dosyası değildir.', 'warning');
            return;
          }

          img = new Image();

          img.onload = function () {
            inputWidth = this.width;
            inputHeight = this.height;
          };

          img.src = window.URL.createObjectURL(file);
          formData = new FormData();

          formData.append('file', file);

          loadMaskEl = CKEDITOR.dom.element.createFromHtml(
            '<div style="position:relative;z-index:100;width:100%;height:100%;text-align:center;background:white;opacity:0.75;pointer-events:none">' +
            '<div style="width:100%;height:30px;margin-top:100px;">Resim gönderiliyor...</div>' +
            '</div>'
          );

          editor.insertElement(loadMaskEl);
          editor.setReadOnly(true);

          jQuery
            .ajax({
              url: editor.config.imageUploadURL,
              headers: editor.config.imageUploadHeaders ? editor.config.imageUploadHeaders : {},
              type: 'POST',
              data: formData,
              processData: false,
              contentType: false
            })
            .success(function (data, textStatus, jqXHR) {
              editor.setReadOnly(false);
              loadMaskEl.remove();

              if (jqXHR.status == 200 && data.success !== false) {
                imgSrc = editor.config.dataParser(data);
                imgContainerEl = new CKEDITOR.dom.element('p');

                if (editor.config.srcSet) {
                  srcSet = editor.config.srcSet(data);
                  imgHtml = '<img src="' + imgSrc + '" class="image-editor img-responsive" srcset="' + srcSet + '" data-width="' + inputWidth + '" data-height="' + inputHeight + '" height="' + inputHeight + '" width="' + inputWidth + '">';
                } else {
                  imgHtml = '<img src="' + imgSrc + '" class="image-editor img-responsive" data-width="' + inputWidth + '" data-height="' + inputHeight + '" height="' + inputHeight + '" width="' + inputWidth + '">';
                }

                imgContainerEl.append(CKEDITOR.dom.element.createFromHtml(imgHtml));
                editor.insertElement(imgContainerEl);
              }
            })
            .error(function (data, textStatus, jqXHR) {
              editor.setReadOnly(false);
              editor.showNotification('Resim gönderilirken bir hata oluştu. Lütfen birazdan yeniden deneyin.', 'warning');
              loadMaskEl.remove();
            });
        }
      }
    });

    editor.ui.addButton('SImage', {
      label: 'Resim ekle',
      command: 'simage',
      toolbar: 'insert'
    });
  }
});
