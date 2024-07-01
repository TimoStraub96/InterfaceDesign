const video = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// Zugriff auf die Webcam
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    video.srcObject = stream;
}).catch((err) => {
    console.error("Error accessing webcam: ", err);
});

// Starten der Erkennung, sobald das Video abgespielt wird
video.addEventListener('play', () => {
    cv['onRuntimeInitialized'] = () => {
        const arucoDict = new cv.aruco_Dictionary(cv.aruco.DICT_6X6_250);
        const parameters = new cv.aruco_DetectorParameters();

        function detectMarkers() {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const mat = cv.matFromImageData(imageData);
                const markerCorners = new cv.MatVector();
                const markerIds = new cv.Mat();
                const rejectedCandidates = new cv.MatVector();

                cv.aruco.detectMarkers(mat, arucoDict, markerCorners, markerIds, parameters, rejectedCandidates);

                if (markerIds.rows > 0) {
                    cv.aruco.drawDetectedMarkers(mat, markerCorners, markerIds);
                    for (let i = 0; i < markerIds.rows; i++) {
                        const id = markerIds.intAt(i, 0);
                        if (id === 1) {
                            const corners = markerCorners.get(i).data32F;
                            drawTicTacToeBoard(corners);
                        }
                    }
                }

                cv.imshow('canvas', mat);

                mat.delete();
                markerCorners.delete();
                markerIds.delete();
                rejectedCandidates.delete();
            }
            requestAnimationFrame(detectMarkers);
        }

        function drawTicTacToeBoard(corners) {
            const [topLeftX, topLeftY, topRightX, topRightY, bottomRightX, bottomRightY, bottomLeftX, bottomLeftY] = corners;

            context.strokeStyle = 'red';
            context.lineWidth = 3;

            // Zeichnen des äußeren Quadrats
            context.beginPath();
            context.moveTo(topLeftX, topLeftY);
            context.lineTo(topRightX, topRightY);
            context.lineTo(bottomRightX, bottomRightY);
            context.lineTo(bottomLeftX, bottomLeftY);
            context.closePath();
            context.stroke();

            // Zeichnen des Gitters innerhalb des Quadrats
            const cellWidth = (topRightX - topLeftX) / 3;
            const cellHeight = (bottomLeftY - topLeftY) / 3;

            // Zeichnen der horizontalen Linien
            for (let i = 1; i < 3; i++) {
                context.beginPath();
                context.moveTo(topLeftX, topLeftY + i * cellHeight);
                context.lineTo(topRightX, topRightY + i * cellHeight);
                context.stroke();
            }

            // Zeichnen der vertikalen Linien
            for (let i = 1; i < 3; i++) {
                context.beginPath();
                context.moveTo(topLeftX + i * cellWidth, topLeftY);
                context.lineTo(bottomLeftX + i * cellWidth, bottomLeftY);
                context.stroke();
            }
        }

        detectMarkers();
    };
});
