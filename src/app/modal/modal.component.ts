import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit {
  @Input() modalId;
  @Input() modalSize;

  modalSizeConfig: any;

  constructor() {}

  ngOnInit() {
    this.modalSizeConfig = {
      'modal-sm': this.modalSize == 'sm',
      'modal-lg': this.modalSize == 'lg',
      'modal-xl': this.modalSize == 'xl',
    };
  }
}
