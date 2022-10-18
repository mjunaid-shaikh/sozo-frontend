import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SozoApiService } from 'src/app/sozo-api.service';
import { SozoDataService } from 'src/app/sozo-data.service';
import {
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import * as $ from 'jquery';

@Component({
  selector: 'app-admin-setting',
  templateUrl: './admin-setting.component.html',
  styleUrls: ['./admin-setting.component.css'],
})
export class AdminSettingComponent implements OnInit {
  filterTerm!: string;
  // initial add team members form
  @ViewChild('closeButton') closeButton: ElementRef;
  records: any = [];
  // form initilization
  addNewMember = new FormGroup({
    first_name: new FormControl('', Validators.required),
    last_name: new FormControl('', Validators.required),
    phone: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    isAdmin: new FormControl(false),
    isActive: new FormControl(true),
  });

  isEdit:any = null;
  // form invalid state
  InvalidForm: boolean = false;
  getMembersData = [];
  constructor(private SDS: SozoDataService, private SAS: SozoApiService) { }

  ngOnInit(): void {
    this.records = [
      {
        name: 'Danielle Holmes',
        Date: '26 Jan 2022',
      },
      {
        name: 'Adasdas Holmes',
        Date: '26 Jan 2022',
      },
      {
        name: 'James Holmes',
        Date: '26 Jan 2022',
      },
      {
        name: 'Steve Holmes',
        Date: '26 Jan 2022',
      },
      {
        name: 'Bruce Holmes',
        Date: '26 Jan 2022',
      },
      {
        name: 'Jackie Holmes',
        Date: '26 Jan 2022',
      },
      {
        name: 'Max John',
        Date: '17 Jan 2022',
      },
    ];
    this.getInitial();
  }

  // SWITCH BUTTON 'VISIBLE ONLY' ADMIN SETTINGS EDIT BUTTON

  modalCustomSwitchBtn: boolean = true;

  onClickEditButton() {

    $('.isActiveUser').show();

    const title = document.getElementsByClassName('modal-title-admin')[0];
    const btnFlag = document.getElementById('closeModal');
    document.getElementById('emailAddress4')['readOnly'] = true;

    btnFlag.innerHTML = 'Update';
    const addUserAdmin = document.getElementsByClassName(
      'custom-control-label'
    )[0];
    // title.innerHTML = 'Edit User';
    document.getElementsByClassName('modal-title')[0].innerHTML = 'Edit a User';
    addUserAdmin.innerHTML = 'Admin';
    this.modalCustomSwitchBtn = false;
  }

  // check box change val
  checkValue(event: any) {

    if (!event.target.checked) {
      $('#customSwitchActiveUser').text('Deactivate User');
    } else {
      $('#customSwitchActiveUser').text('Activate User');
    }


  }

  onClickAddBtn() {
    this.isEdit = null
    this.addNewMember.reset();
    this.addNewMember.patchValue({ isAdmin: false });
    $('.isActiveUser').hide();
    document.getElementById('emailAddress4')['readOnly'] = false;
    const title = document.getElementsByClassName('modal-title-admin')[0];
    const btnFlag = document.getElementById('closeModal');
    btnFlag.innerHTML = 'Add';
    const addUserAdmin = document.getElementsByClassName(
      'custom-control-label'
    )[0];
    title.innerHTML = 'Add a User';
    document.getElementsByClassName('modal-title')[0].innerHTML = 'Add a User';
    addUserAdmin.innerHTML = 'Admin';
    this.modalCustomSwitchBtn = true; // CHANGED VALUE 'TRUE' TO VIEW SWITCH BTN IN ADD A USER MODAL
  }

  // //////////////////////
  // add member section
  // /////////////////////
  addMemberSubmit() {
    //console.log('form val', this.addNewMember.value);

    //console.log("is edit", this.isEdit);


    try {
      if (this.addNewMember.valid) {
        // update user
        if (this.isEdit) {

          $('#loader').show();
          this.SAS.updateTeamsMember(this.isEdit, this.addNewMember.value).subscribe(
            (res) => {
              try {
                this.addNewMember.reset();
                this.InvalidForm = false;
                this.getInitial();
                $('#loader').hide();
                this.closeButton.nativeElement.click();
              } catch (error) { }
            },
            (error) => {
              $('#loader').hide();
              this.SDS.apiErrorHandle(error.status.toString(), error, false);
            }
          );

        } else {
          $('#loader').show();
          this.SAS.addTeamsMember(this.addNewMember.value).subscribe(
            (res) => {
              try {
                this.addNewMember.reset();
                this.InvalidForm = false;
                this.getInitial();
                $('#loader').hide();
                this.closeButton.nativeElement.click();
              } catch (error) { }
            },
            (error) => {
              $('#loader').hide();
              this.SDS.apiErrorHandle(error.status.toString(), error, false);
            }
          );
        }

      } else {
        // alert('Please enter valid deatils')

        this.InvalidForm = true;

        // $('#')
      }
    } catch (error) { }
  }
  getInitial() {
    this.SAS.getTeamsMember().subscribe((res) => {
      this.getMembersData = res['users'];
    });
  }

  // EDIT BUTTON FOR UPDATING DETAILS

  onEdit(item: any) {
    //console.log('items val', item);

    this.isEdit =item._id

    this.addNewMember.controls['first_name'].setValue(item.first_name);
    this.addNewMember.controls['last_name'].setValue(item.last_name);
    this.addNewMember.controls['phone'].setValue(item.phone);
    this.addNewMember.controls['email'].setValue(item.email);
    this.addNewMember.controls['isAdmin'].setValue(item.isAdmin);
    this.addNewMember.controls['isActive'].setValue(item.isActive);

    if (!item.isActive) {
      $('#customSwitchActiveUser').text('Deactivate User');
    } else {
      $('#customSwitchActiveUser').text('Activate User');
    }


  }
}
