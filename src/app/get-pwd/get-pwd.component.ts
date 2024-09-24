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
  ciphertext: "6d1e8cfdcf132a675ffe4e5213d4679ad0472ad9d95a779802755ecc89723ab456ca618a4d8b4b25b2858bf7fa06363e",
  iv: "bf9523ca31fbdb0d3452d63d36d7a0b4",
  salt: "78cd6628d7bbee9c75d9c40e61072c90"
}

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

  // Handle the form submission
  onSubmit(): void {
    const formData = this.getPwdForm.value;

    try {
      const decryptedApiKey = this.decryptKey(formData.password);
      this.sendPasswordEvent.emit(decryptedApiKey)
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