import { Routes } from '@angular/router';
import { HomeComponent } from './features/pages/home/home.component';
import { CategoryComponent } from './features/pages/category/category.component';
import { NotFoundComponent } from './shared/components/layout/not-found-container/not-found-container.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { ProductDetailsComponent } from './features/pages/products/components/product-list/components/product-details/product-details.component';
import { CartPageComponent } from './features/pages/cart/cart-page/cart-page.component';
import { LoginComponent } from './features/pages/auth/login/login.component';
import { RegisterComponent } from './features/pages/auth/register/register.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'category/:slug', component: CategoryComponent },
      { path: 'product/:id', component: ProductDetailsComponent },
      { path: 'cart', component: CartPageComponent }
    ]
  },
  {
    path: 'auth', children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },

  { path: '**', component: NotFoundComponent }
];
