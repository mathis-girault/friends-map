import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../service/toast.service';
import CryptoJS from 'crypto-js';

interface EncryptedData {
  salt: string;
  iv: string;
  ciphertext: string;
}

const encryptedBaseKey: EncryptedData = {
  ciphertext: "5466e0fd34ac523bf8efa977854afda752d45de5fd5fabf6052e0a922bd41263262a336314d9707d8714e9fb7a3c29b5ba8acaa9851162bcac589d86a45b715ace33c5c5f3f3bd26e26b0544fec260647afdc3e6b1281f0bb58170696b95e3f6d9b238750711dceaea2447335d2e0a4b2920151c1606034185c0adf6c79b905bc68255c571aae8a4b5ce60ed8be58b88",
  iv: "5a2f327ad12cac0dddc984458b2e2340",
  salt: "f1ce9d7b217f95b3a3b68fb2e172848b"
}

const encryptedFirebaseKey: EncryptedData = {
  ciphertext: "c8650931d7a8f62e2516f164b9822370dd3fb5711d7025f87a768336b48165330a6019618410fb41267d3035b7f6fd59",
  iv: "c1392da85a93493da52dae8f496b811c",
  salt: "234d1f9d40c88b74ff0c13758ca3361f"
}

const encryptedIDFMobiKey: EncryptedData = {
  ciphertext: "888113fb8a080d9eda0f7f8a07f758fd18dff3d66dc5b3f9459744bd09d0c5ebafdc4c992b9123b216ad797999237665",
  iv: "5e5059e8fb00980d6a8f9525df371009",
  salt: "2315578498f2448bf75da885f8779bfe"
}

const CACHE_TOKEN = 'cachedPasswordFriendsMap';

@Component({
  selector: 'app-get-pwd',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './get-pwd.component.html',
  styleUrl: './get-pwd.component.css'
})
export class GetPwdComponent implements OnInit {
  getPwdForm: FormGroup;

  @Output() sendPasswordEvent = new EventEmitter<{ firebaseApiKey: string, IDFMobiApiKey: string }>();

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
        const decryptedKey = this.decryptApiKey(encryptedBaseKey, cachedPassword);
        
        this.decryptAndSendKeys(decryptedKey);
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
      const decryptedApiKey = this.decryptApiKey(encryptedBaseKey, formData.password);
      this.decryptAndSendKeys(decryptedApiKey);
      localStorage.setItem(CACHE_TOKEN, formData.password);
    } catch (error) {
      this.toastService.addToast('error', "Le mot de passe est incorrect");
    }
  }

  decryptAndSendKeys(password: string): void {
    try {
      const decryptedFirebaseKey = this.decryptApiKey(encryptedFirebaseKey, password);
      const decryptedIDFMobiKey = this.decryptApiKey(encryptedIDFMobiKey, password);

      this.sendPasswordEvent.emit({
        firebaseApiKey: decryptedFirebaseKey,
        IDFMobiApiKey: decryptedIDFMobiKey
      });
    } catch (error) {
      this.toastService.addToast('error', "Le mot de passe est incorrect");
    }
  }

  // Decrypt the API key using the password, throws an error if decryption fails
  decryptApiKey(crypted: EncryptedData, password: string): string {
    const decryptedKey = decryptKey(crypted, password);
    if (decryptedKey === null) {
      console.error("Decryption failed");
      throw new Error;
    }

    return decryptedKey;
  }
}

function decryptKey(encryptedData: EncryptedData, secret: string): string | null {
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
/* function encryptApiKey(apiKey: string, secret: string) {
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
} */

