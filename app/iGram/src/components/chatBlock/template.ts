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
        <span class="chat_name"></span>
        <form class="confingForm">
            <input type="file" id="filePhotoLoad" class="filePhotoLoad" accept="jpg, .jpeg, .png" size="1000000"/>
            <label for="filePhotoLoad" class="loadPhotoBtn">Загрузить фото</label>
        </form>
        <button class="leaveGroup">Выйти из группы</button>
    </div>
`