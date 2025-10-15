import { HttpInterceptorFn } from "@angular/common/http"
import { orgLoginService } from "../services/org-login-service";
import { inject } from "@angular/core"

export const libraryInterceptor: HttpInterceptorFn = (req, next) => {

    const authToken = inject(orgLoginService);

    const token = authToken.getToken();
    console.log('Token found');

    if(token){
        const cloned = req.clone ({setHeaders:{
            Authorization: `Bearer ${token}`
        }
        });
        return next(cloned);
    }
    console.log('No token found, skipping auth header');
    return next(req);
}