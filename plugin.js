CKEDITOR.plugins.add('simage', {
    icons: 'simage',
    allowedContent: 'img[alt,!src,width,height,data-width,data-height]{border-style,border-width,float,height,margin‌​,margin-bottom,margi‌​n-left,margin-right,‌​margin-top,width}',
    init: function (editor) {
        editor.addCommand('simage', {
            exec: function () {
                var fileInput = document.createElement('input');

                fileInput.setAttribute('type', 'file');
                fileInput.setAttribute('accept', '.jpg,.jpeg,.png,.tif,.gif,.svg');
                fileInput.click();

                fileInput.onchange = function () {
                    var file = fileInput.files[0],
						img, inputWidth, inputHeight, formData, loaderElem,
						loaderHtmlStr, loaderDomEle, url, elem, maxWidth, maxHeight,
						width, height, newLine, srcSet, imgElem, imgDomElem;

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

                    loaderElem = new CKEDITOR.dom.element('loader-elem');
		            loaderHtmlStr = (
		               	'<div style="position:relative;z-index:100;width:100%;height:100%;text-align:center;background:white;opacity:0.75;pointer-events:none">' +
		               	    '<div style="width:100%;height:30px;margin-top:100px;">Resim gönderiliyor...</div>' +
		               	'</div>'
		            );
		            loaderDomEle = CKEDITOR.dom.element.createFromHtml(loaderHtmlStr);

                    loaderElem.append(loaderDomEle);
                    editor.insertElement(loaderElem);
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
                            loaderElem.remove();

                            if (jqXHR.status == 200 && data.success !== false) {
                                url = editor.config.dataParser(data);
                                elem = new CKEDITOR.dom.element('elem');
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

                                newLine = CKEDITOR.dom.element.createFromHtml('<p><br></p>');

                                if (editor.config.srcSet) {
                                    srcSet = editor.config.srcSet(data);
                                    imgElem = '<img src="' + url + '" class="image-editor" srcset="'+ srcSet +'" data-width="' + inputWidth + '" data-height="' + inputHeight + '" height="' + height + '" width="' + width + '">';
                                }
								else {
                                    imgElem = '<img src="' + url + '" class="image-editor" data-width="' + inputWidth + '" data-height="' + inputHeight + '" height="' + height + '" width="' + width + '">';
                                }

                                imgDomElem = CKEDITOR.dom.element.createFromHtml(imgElem);

                                elem.append(imgDomElem);
                                editor.insertElement(newLine);
                                editor.insertElement(elem);
                                editor.insertElement(newLine);
                            }
                        })
						.error(function(data, textStatus, jqXHR) {
                            editor.setReadOnly(false);
                            editor.showNotification('Resim gönderilirken bir hata oluştu. Lütfen birazdan yeniden deneyin.', 'warning');
                            loaderElem.remove();
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
