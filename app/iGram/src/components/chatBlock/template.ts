export const chatTemplate = `
    <div class="chat">
        
        <div class="mainMessageBlock">

        </div>
        
    </div>
`
export const messageMeT = `
    <div class="message me">
        <img src="" alt="">
         <div  class="messageData">
            <div class="message_name"></div>
            <div class="message_text"></div>
            <div class="message_date"></div>
        </div>
    </div>
`
export const messageFromT = `
    <div class="message from">
        <img src="" alt="" class="userPhoto">
        <div class="messageData">
            <div class="message_name"></div>
            <div class="message_text"></div>
            <div class="message_date"></div>
        </div>
    </div>
`
export const sendChatBlockT =   `
    <div class="sendBlock">
        <input type="text">
        <button>Отправить</button>
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