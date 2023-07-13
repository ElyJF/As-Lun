import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CoursesComponent } from './courses/courses.component';
import { WorksComponent } from './works/works.component';
import { ContactComponent } from './contact/contact.component';
import { FooterComponent } from './footer/footer.component';




const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'works', component: WorksComponent },
  {path: 'courses', component: CoursesComponent},
  {path: 'contact', component: ContactComponent},
  { path: 'footer', component: FooterComponent },

 
  // Otras rutas si las tienes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

