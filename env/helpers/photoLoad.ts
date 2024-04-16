export function setupLoadPhotoEvent(input: HTMLInputElement, callback: (bufferedPhoto: ArrayBuffer) => void) {
    input.onchange = () => {
        const selectedFile = input.files?.[0];
        if (selectedFile && (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const arrayBuffer = event.target?.result as ArrayBuffer;
                const uint8Array = new Uint8Array(arrayBuffer);

                callback(uint8Array);
            };

            reader.readAsArrayBuffer(selectedFile);
        } else {
            alert("Пожалуйста, выберите файл в формате JPEG или PNG.");
            input.value = "";
        }

    };
}