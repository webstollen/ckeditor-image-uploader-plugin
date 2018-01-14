CKEDITOR.plugins.add('simage', {
    icons: 'simage',
    init: function (editor) {
        editor.addCommand('simage', {
			allowedContent: 'img[alt,!src,width,height,data-width,data-height,data-cke-saved-src]{border-style,border-width,float,height,margin‌​,margin-bottom,margi‌​n-left,margin-right,‌​margin-top,width}',
            exec: function () {
                var fileInput = document.createElement('input');

                fileInput.setAttribute('type', 'file');
                fileInput.setAttribute('accept', '.jpg,.jpeg,.png,.tif,.gif,.svg');
                fileInput.click();

                fileInput.onchange = function () {
                    var file = fileInput.files[0],
						img, inputWidth, inputHeight, formData, loadMaskEl,
						imgSrc, imgContainerEl, imgHtml, maxWidth, maxHeight,
						width, height, srcSet;

                    if (file.size > 5000000) {
                        editor.showNotification('Dosya boyutu izin verilen sınırı aşıyor. Lütfen en fazla 5 MB büyüklüğünde bir dosya seçin.', 'warning');
                        return;
                    }
					else if (['jpeg','jpg','png','svg','gif','tif', 'svg+xml'].indexOf(file.type.split('/')[1]) === -1) {
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
                            type: 'POST',
                            data: formData,
                            processData: false,
                            contentType: false
                        })
						.success(function(data, textStatus, jqXHR) {
                            editor.setReadOnly(false);
                            loadMaskEl.remove();

                            if (jqXHR.status == 200 && data.success !== false) {
                                imgSrc = editor.config.dataParser(data);
                                imgContainerEl = new CKEDITOR.dom.element('p');
                                maxWidth = Math.min(inputWidth, 600);
                                maxHeight = Math.min(inputHeight, 600);

                                if ((maxWidth / maxHeight) > (inputWidth / inputHeight)) {
                                    width = (maxWidth * inputWidth) / inputHeight;
                                    height = maxHeight;
                                }
								else if ((maxWidth / maxHeight) < (inputWidth / inputHeight)) {
                                    width = maxWidth;
                                    height = (maxHeight * inputHeight) / inputWidth;
                                }
								else {
                                    width = maxWidth;
                                    height = maxHeight;
                                }

                                if (editor.config.srcSet) {
                                    srcSet = editor.config.srcSet(data);
                                    imgHtml = '<img src="' + imgSrc + '" class="image-editor" srcset="'+ srcSet +'" data-width="' + inputWidth + '" data-height="' + inputHeight + '" height="' + height + '" width="' + width + '">';
                                }
								else {
                                    imgHtml = '<img src="' + imgSrc + '" class="image-editor" data-width="' + inputWidth + '" data-height="' + inputHeight + '" height="' + height + '" width="' + width + '">';
                                }

                                imgContainerEl.append(CKEDITOR.dom.element.createFromHtml(imgHtml));
                                editor.insertElement(imgContainerEl);
                            }
                        })
						.error(function(data, textStatus, jqXHR) {
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
