import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contactData = {
    name: '',
    email: '',
    message: ''
};

submitForm() {
  // Puedes redirigir a una página específica o enviar un mensaje de WhatsApp aquí
  // Por ejemplo, para redirigir a una página:
  // window.location.href = 'https://www.example.com/contact-success';

  // O para enviar un mensaje de WhatsApp:
  const whatsappURL = 'https://wa.me/543516183289?text=' + encodeURIComponent(this.contactData.message);
  window.open(whatsappURL, '_blank');
}
}