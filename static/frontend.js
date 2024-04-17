document.addEventListener("DOMContentLoaded", function() {
    var layout = {
        margin: { l: 0, r: 0, b: 0, t: 0 },
        paper_bgcolor: 'rgba(0,0,0,0)', // Set background color to transparent
        plot_bgcolor: 'rgba(0,0,0,0)', // Set plot background to transparent
        scene: {
            xaxis: {
                showgrid: false,
                zeroline: false,
                showticklabels: false,
                showspikes: false,
                showbackground: false,
                title: ''
            },
            yaxis: {
                showgrid: false,
                zeroline: false,
                showticklabels: false,
                showspikes: false,
                showbackground: false,
                title: ''
            },
            zaxis: {
                showgrid: false,
                zeroline: false,
                showticklabels: false,
                showspikes: false,
                showbackground: false,
                title: ''
            },
            aspectmode: 'manual',
            aspectratio: {
                x: 1, y: 1, z: 0.5 // or any value smaller than 1
            },
            camera: {
                eye: { x: 1.5, y: 1.5, z: 2.5 } // Move the camera farther away on the z-axis
            }
        },
        showlegend: false // Set to false to hide the legend, if there is any
    };

    function generateMeshData(points) {
        console.log("Starting to generate mesh data for points", points.length); // Log the number of points
    
        var vertices = [];
        var faces = [];
        var faceIndex = 0;
    
        points.forEach(point => {
            console.log("Processing point:", point); // Log the current point being processed
    
            var baseIndex = faceIndex * 8; // Each cube has 8 vertices
            var cubeVertices = [
                [point[0], point[1], point[2]],
                [point[0] + 1, point[1], point[2]],
                [point[0] + 1, point[1] + 1, point[2]],
                [point[0], point[1] + 1, point[2]],
                [point[0], point[1], point[2] + 1],
                [point[0] + 1, point[1], point[2] + 1],
                [point[0] + 1, point[1] + 1, point[2] + 1],
                [point[0], point[1] + 1, point[2] + 1]
            ];
    
            vertices.push(...cubeVertices);
            console.log("Vertices added for point:", cubeVertices); // Log vertices added
    
            var cubeFaces = [
                [baseIndex, baseIndex + 1, baseIndex + 2], [baseIndex, baseIndex + 2, baseIndex + 3],
                [baseIndex + 4, baseIndex + 5, baseIndex + 6], [baseIndex + 4, baseIndex + 6, baseIndex + 7],
                [baseIndex, baseIndex + 4, baseIndex + 5], [baseIndex, baseIndex + 5, baseIndex + 1],
                [baseIndex + 1, baseIndex + 5, baseIndex + 6], [baseIndex + 1, baseIndex + 6, baseIndex + 2],
                [baseIndex + 2, baseIndex + 6, baseIndex + 7], [baseIndex + 2, baseIndex + 7, baseIndex + 3],
                [baseIndex + 3, baseIndex + 7, baseIndex + 4], [baseIndex + 3, baseIndex + 4, baseIndex]
            ];
            faces.push(...cubeFaces);
            console.log("Faces added for point:", cubeFaces); // Log faces added
    
            faceIndex++;
        });
    
        var flatVertices = vertices.flat();
        var flatFaces = faces.flat();
        console.log("All vertices:", flatVertices); // Log all vertices
        console.log("All faces:", flatFaces); // Log all faces
    
        return {
            type: 'mesh3d',
            x: flatVertices.filter((_, i) => i % 3 === 0),
            y: flatVertices.filter((_, i) => i % 3 === 1),
            z: flatVertices.filter((_, i) => i % 3 === 2),
            i: flatFaces.filter((_, i) => i % 3 === 0),
            j: flatFaces.filter((_, i) => i % 3 === 1),
            k: flatFaces.filter((_, i) => i % 3 === 2),
            flatshading: true,
            color: '#D3D3D3',
            line: { color: '#000000', width: 1.5 },
            lighting: { ambient: 0.8, diffuse: 1.0, specular: 2.0, roughness: 0.3, fresnel: 0.5 },
            lightposition: { x: 100, y: 200, z: 200 }
        };
    }
    

    var sendBtn = document.getElementById('sendBtn');
    var messageInput = document.getElementById('messageInput');
    var chatArea = document.getElementById('chat');

    sendBtn.addEventListener('click', function() {
        console.log("button clicked")
        var message = messageInput.value.trim();
        if (message) {
            // Display "Making Request" message in the chat area
            appendMessageToChat("Making Request");

            fetch('/generate-voxel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'text=' + encodeURIComponent(message)
            })
            .then(response => response.json())
            .then(data => {
                // Display "Data Returned" message in the chat area
                appendMessageToChat("Data Returned");

                Plotly.purge('voxelPlot');
                var meshData = generateMeshData(data.points);
                Plotly.newPlot('voxelPlot', [meshData], layout);

                // Display "Building Model" message in the chat area
                appendMessageToChat("Building Model");
            })
            .catch(error => {
                console.error('Error:', error);
                // Display error message in the chat area
                appendMessageToChat("Error occurred while processing request.");
            });
            messageInput.value = '';
        } else {
            console.error('Message input is empty.');
        }
    });

    // Function to append a message to the chat area
    function appendMessageToChat(message) {
        var chatMessage = document.createElement('div');
        chatMessage.textContent = message;
        chatArea.appendChild(chatMessage);
    }
});