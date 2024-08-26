$(function() {
    const canvas = $("#myCanvas")[0];
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;

            // キャンバスのサイズを設定（パフォーマンスを考慮して縮小）
    const CANVAS_WIDTH = 291 * 4;
    const CANVAS_HEIGHT = 421 * 4;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

            // CSSでキャンバスの表示サイズを設定
    $("#myCanvas").css({
        width: "291px",
        height: "421px",
        border: "1px solid black"
    });

    const img = new Image();
    const profileImage = new Image();
    let profileImageX = 87 * 4;
    let profileImageY = 67 * 4;
    const profileImageRadius = 116 * 4;
    let isDragging = false;

    img.src = './name_ver6.png';
    img.onload = function() {
        console.log('初期画像が読み込まれました');
        drawInitialImage();
    };
    img.onerror = function() {
        console.error('初期画像の読み込みに失敗しました');
        alert('背景画像の読み込みに失敗しました。ページを再読み込みしてください。');
    };

    function loadProfileImage(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            profileImage.src = e.target.result;
            profileImage.onload = drawInitialImage;
        }
        reader.onerror = function() {
            console.error('プロフィール画像の読み込みに失敗しました');
            alert('プロフィール画像の読み込みに失敗しました。別の画像を試してください。');
        }
        reader.readAsDataURL(file);
    }

    function drawInitialImage() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (img.complete) {
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
        }

        if (profileImage.complete) {
            context.save();
            context.beginPath();
            context.arc(profileImageX + profileImageRadius / 2, profileImageY + profileImageRadius / 2, profileImageRadius / 2, 0, Math.PI * 2, true);
            context.closePath();
            context.clip();

            context.drawImage(profileImage, profileImageX, profileImageY, profileImageRadius, profileImageRadius);
            context.restore();
        }

        drawText();
        drawQRCode();
    }

    function drawText() {
        const name = DOMPurify.sanitize($("#name").val());
        const skills = DOMPurify.sanitize($("#skills").val());
        const hobbies = DOMPurify.sanitize($("#hobbies").val());

                // 名前の文字サイズ
        context.font = `${28 * 4}px Arial`;
        context.textBaseline = "top";
        context.fillStyle = "#36455E";
        context.fillText(name, 74 * 4, 200 * 4);

                // スキルと趣味の文字サイズを小さくする
                context.font = `${20 * 4}px Arial`;  // ここで文字サイズを小さくしています
                context.fillText(skills, 74 * 4, 255 * 4);
                context.fillText(hobbies, 74 * 4, 304 * 4);
            }

            function drawQRCode() {
                function drawSingleQRCode(link, x, y) {
                    if (link) {
                        QRCode.toDataURL(link, { width: 60 * 4, height: 60 * 4 }, function(err, url) {
                            if (err) {
                                console.error("QRコードの生成エラー:", err);
                                alert('QRコードの生成に失敗しました。入力したリンクが正しいか確認してください。');
                                return;
                            }
                            const qrImage = new Image();
                            qrImage.onload = function() {
                                context.drawImage(qrImage, x * 4, y * 4, 60 * 4, 60 * 4);
                            };
                            qrImage.onerror = function() {
                                console.error("QR画像の読み込みエラー");
                                alert('QRコードの画像読み込みに失敗しました。別のQRコードリンクを試してください。');
                            };
                            qrImage.src = url;
                        });
                    }
                }

                const lineQrLink = DOMPurify.sanitize($("#lineQrLink").val());
                drawSingleQRCode(lineQrLink, 199, 336);
            }

            $("#name, #skills, #hobbies, #lineQrLink").on("input", drawInitialImage);

            $("#profileImage").on("change", function(e) {
                if (e.target.files && e.target.files[0]) {
                    loadProfileImage(e.target.files[0]);
                }
            });

            $("#downloadBtn").click(function() {
                const dataURL = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.href = dataURL;
                downloadLink.download = "nameplate.png";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            });

            canvas.addEventListener("mousedown", function(event) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const mouseX = (event.clientX - rect.left) * scaleX;
                const mouseY = (event.clientY - rect.top) * scaleY;
                const centerX = profileImageX + profileImageRadius / 2;
                const centerY = profileImageY + profileImageRadius / 2;
                const distance = Math.sqrt((mouseX - centerX) ** 2 + (mouseY - centerY) ** 2);
                if (distance <= profileImageRadius / 2) {
                    isDragging = true;
                }
            });

            canvas.addEventListener("mousemove", function(event) {
                if (isDragging) {
                    const rect = canvas.getBoundingClientRect();
                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;
                    profileImageX = (event.clientX - rect.left) * scaleX - profileImageRadius / 2;
                    profileImageY = (event.clientY - rect.top) * scaleY - profileImageRadius / 2;

                    // アイコンの移動範囲を制限
                    profileImageX = Math.max(0, Math.min(profileImageX, canvas.width - profileImageRadius));
                    profileImageY = Math.max(0, Math.min(profileImageY, canvas.height - profileImageRadius));

                    drawInitialImage();
                }
            });

            canvas.addEventListener("mouseup", function() {
                isDragging = false;
            });

            canvas.addEventListener("mouseleave", function() {
                isDragging = false;
            });
        });