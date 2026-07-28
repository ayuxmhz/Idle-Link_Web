"use server"; // server side api call
import { register, login, googleAuth } from "@/lib/api/auth";
import { RegisterFormData } from "@/app/(auth)/register/schema";
import { LoginFormData } from "@/app/(auth)/login/schema";
import { setTokenCookie, storeUserData } from "@/lib/cookies";

export const handleRegisterUser = async (data: RegisterFormData) => {
    try{
        // how to handle data from component and how to send to component
        const result = await register(data);
        if(result.success){
            return { success: true, message: result.message, data: result.data }; 
        }else{
            return { success: false, message: result.message || 'Registration failed' };    
        }
    }catch (error){
        const errorMsg = (error as { message?: string })?.message || 'Registration failed';
        return { success: false, message: errorMsg };    
    }
}
export const handleLoginUser = async (data: LoginFormData) => {
    try{
        // how to handle data from component and how to send to component
        const result = await login(data);

        if(result.success){
            // only set cookies when login actually succeeded
            const user = result.data.user;
            const token = result.data.token;
            await setTokenCookie(token);
            await storeUserData(user);
            return { success: true, message: result.message, data: result.data }; 
        }else{
            return { success: false, message: result.message || 'Login failed' };    
        }
    }catch (error){
        const errorMsg = (error as { message?: string })?.message || 'Login failed';
        return { success: false, message: errorMsg };
    }
}
export const handleGoogleAuth = async (accessToken: string) => {
    try{
        const result = await googleAuth(accessToken);

        if(result.success){
            const user = result.data.user;
            const token = result.data.token;
            await setTokenCookie(token);
            await storeUserData(user);
            return { success: true, message: result.message, data: result.data };
        }else{
            return { success: false, message: result.message || 'Google sign-in failed' };
        }
    }catch (error){
        const errorMsg = (error as { message?: string })?.message || 'Google sign-in failed';
        return { success: false, message: errorMsg };
    }
}