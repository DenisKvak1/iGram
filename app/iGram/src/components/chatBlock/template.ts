export const chatTemplate = `
    <div class="chat">
        
        <div class="mainMessageBlock">

        </div>
        
    </div>
`

export const sendChatBlockT =   `
    <div class="sendBlock">
        <div contenteditable="true" class="messageInput" ></div>

        <input required type="file" class="clipImageInput" id="fileMessagePhotoLoad" accept="image/jpeg, image/png, image/gif" size="1000000" style="display: none">
        <label class="clipImage" for="fileMessagePhotoLoad"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#8b8b8b" d="M364.2 83.8c-24.4-24.4-64-24.4-88.4 0l-184 184c-42.1 42.1-42.1 110.3 0 152.4s110.3 42.1 152.4 0l152-152c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-152 152c-64 64-167.6 64-231.6 0s-64-167.6 0-231.6l184-184c46.3-46.3 121.3-46.3 167.6 0s46.3 121.3 0 167.6l-176 176c-28.6 28.6-75 28.6-103.6 0s-28.6-75 0-103.6l144-144c10.9-10.9 28.7-10.9 39.6 0s10.9 28.7 0 39.6l-144 144c-6.7 6.7-6.7 17.7 0 24.4s17.7 6.7 24.4 0l176-176c24.4-24.4 24.4-64 0-88.4z"/></svg></label>
        <button class="sendButton">Отправить</button>
    </div>
`
export const chatInfoBlockT = `
    <div class="chatInfoBlock">
        <button class="toChat"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg></button>
        <span class="chat_name"></span>
        <form class="confingForm">
            <input type="file" id="filePhotoLoad" class="filePhotoLoad" accept="jpg, .jpeg, .png" size="1000000"/>
            <label for="filePhotoLoad" class="loadPhotoBtn">Загрузить фото</label>
        </form>
        <button class="leaveGroup">Выйти из группы</button>
    </div>
`