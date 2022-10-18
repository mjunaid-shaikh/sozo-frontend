import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SozoApiService } from '../sozo-api.service';
import { SozoDataService } from '../sozo-data.service';
declare const $: any;

@Component({
  selector: 'app-invite-link',
  templateUrl: './invite-link.component.html',
  styleUrls: ['./invite-link.component.css'],
})
export class InviteLinkComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private SAS: SozoApiService,
    private router: Router,
    private SDS : SozoDataService
  ) { }

  ngOnInit(): void {
    let id = this.route.snapshot.params.viewId.split('_')[1];
   
    let inviteLink = async () => {
      let responseId;
      try {
        $('#loader').css('display', 'block');
        if (!localStorage.getItem('userToken')) {
          localStorage.setItem('inviteLinkID', id);
          this.router.navigate(['/login']);
        } else {
        
          let response: any = await this.SAS.inviteLinkHandler(id);
        
          responseId = response.id;
          // console.log(response.id._id)
          // console.log('smit')
          //     return;
         
          if (response.folder == null) {
            if (localStorage.getItem('userToken')) {
              this.router.navigate(['/drawing', response.id]);
            }
          } else {
            if (localStorage.getItem('userToken')) {
              
              this.router.navigate(['/dashboard/portfolio-docs', response.id]);
            }
          }
        }
      } catch (error) {
        this.SDS.apiErrorHandle(error?.status.toString(), error);
      }
    };
    inviteLink();
  }
}
