import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../service/toast.service';
import CryptoJS from 'crypto-js';

interface EncryptedData {
  salt: string;
  iv: string;
  ciphertext: string;
}

const encryptedKey: EncryptedData = {
  ciphertext: "276a511d4fab461d9421b7c30c474bab0e1727cb70811c69684011c01bc0161c544d8078067332ba11b040650af67a9b",
  iv: "14f1c3a7e1df9bab5a561f092025936e",
  salt: "882b84a8b8cbf784598b09cf9c7cb8f4"
}

const CACHE_TOKEN = 'cachedPasswordFriendsMap';

@Component({
  selector: 'app-get-pwd',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './get-pwd.component.html',
  styleUrl: './get-pwd.component.css'
})
export class GetPwdComponent {
  getPwdForm: FormGroup;

  @Output() sendPasswordEvent = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder, 
    private toastService: ToastService
  ) {
    // Initialize the form with form controls and validators
    this.getPwdForm = this.fb.group({
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.checkCachedPassword();
  }

  checkCachedPassword(): void {
    try {
      const cachedPassword = localStorage.getItem(CACHE_TOKEN);
      if (cachedPassword != null) {
        const decryptedApiKey = this.decryptKey(cachedPassword);
        this.sendPasswordEvent.emit(decryptedApiKey);
        this.toastService.addToast('success', "Mot de passe récupéré depuis le cache");
      } 
    } catch (error) {
      localStorage.removeItem(CACHE_TOKEN);
    }
  }

  // Handle the form submission
  onSubmit(): void {
    const formData = this.getPwdForm.value;

    try {
      const decryptedApiKey = this.decryptKey(formData.password);
      this.sendPasswordEvent.emit(decryptedApiKey)
      localStorage.setItem(CACHE_TOKEN, formData.password);
    } catch (error) {
      this.toastService.addToast('error', "Le mot de passe est incorrect");
    }
  }

  // Decrypt the API key using the password, throws an error if decryption fails
  decryptKey(password: string): string {
    const decryptedKey = decryptApiKey(encryptedKey, password);
    if (decryptedKey === null) {
      console.error("Decryption failed");
      throw new Error;
    }

    return decryptedKey;
  }
}

function decryptApiKey(encryptedData: EncryptedData, secret: string): string | null {
  // Parse the salt, IV, and ciphertext from hexadecimal strings back to WordArray
  const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
  const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
  const ciphertext = CryptoJS.enc.Hex.parse(encryptedData.ciphertext);

  // Derive the same key from the secret and salt
  const key = CryptoJS.PBKDF2(secret, salt, {
      keySize: 256 / 32,
      iterations: 10000,
  });

  // Create a CipherParams object containing the ciphertext and iv
  const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: ciphertext,
      iv: iv,
  });

  // Decrypt the API key using the derived key and the CipherParams
  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

  // Convert the decrypted data to a UTF-8 string
  const originalKey = decrypted.toString(CryptoJS.enc.Utf8);

  return originalKey || null;
}

// For legacy purposes, function used to encrypt the API key
/**
  function encryptApiKey(apiKey: string, secret: string) {
    const salt = CryptoJS.lib.WordArray.random(128 / 8); // Generate a random salt
    const key = CryptoJS.PBKDF2(secret, salt, {
        keySize: 256 / 32,
        iterations: 10000,
    });

    const iv = CryptoJS.lib.WordArray.random(128 / 8); // Random Initialization Vector
    const encrypted = CryptoJS.AES.encrypt(apiKey, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    // Return an object containing salt, IV, and ciphertext as hexadecimal strings
    return {
        salt: salt.toString(CryptoJS.enc.Hex),
        iv: iv.toString(CryptoJS.enc.Hex),
        ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Hex),
    };
  }
*/
