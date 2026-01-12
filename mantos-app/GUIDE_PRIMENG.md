# Guide PrimeNG pour Débutants

Ce guide explique méthodiquement comment PrimeNG a été configuré et utilisé dans le projet Mantos.

---

## Table des Matières

1. [Qu'est-ce que PrimeNG?](#quest-ce-que-primeng)
2. [Configuration Initiale](#configuration-initiale)
3. [Comment Utiliser un Composant PrimeNG](#comment-utiliser-un-composant-primeng)
4. [Exemples Concrets du Projet](#exemples-concrets-du-projet)
5. [Styling et Personnalisation](#styling-et-personnalisation)
6. [Services PrimeNG](#services-primeng)
7. [Ressources et Documentation](#ressources-et-documentation)

---

## Qu'est-ce que PrimeNG?

**PrimeNG** est une bibliothèque de composants UI pour Angular qui fournit des composants prêts à l'emploi comme des boutons, formulaires, tableaux, menus, etc.

**Avantages:**
- 🎨 Design moderne et professionnel
- 🚀 Gain de temps (pas besoin de coder des composants complexes)
- 📱 Responsive par défaut
- ♿ Accessible (ARIA)
- 🎭 Thèmes personnalisables

---

## Configuration Initiale

### Étape 1: Installation (Déjà fait)

```bash
npm install primeng @primeng/themes primeicons
```

### Étape 2: Configuration Globale

**Fichier: `src/app/app.config.ts`**

```typescript
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    // Autres providers...

    // 1. Active les animations (requis pour PrimeNG)
    provideAnimationsAsync(),

    // 2. Configure PrimeNG avec le thème Aura
    providePrimeNG({
      theme: {
        preset: Aura,  // Thème Aura (moderne)
        options: {
          darkModeSelector: '.dark-theme', // Support du mode sombre
        }
      }
    }),

    // 3. Service global pour les notifications Toast
    MessageService
  ]
};
```

**Explications:**
- `provideAnimationsAsync()` - Active les animations Angular (obligatoire pour PrimeNG)
- `providePrimeNG()` - Configure PrimeNG avec le thème Aura
- `MessageService` - Service pour afficher des notifications (toasts)

### Étape 3: Importer les Icônes (Déjà fait)

**Fichier: `src/styles.css`**

```css
@import 'primeicons/primeicons.css';
```

---

## Comment Utiliser un Composant PrimeNG

### 🎯 Processus en 3 Étapes

#### 1️⃣ **Importer le Module du Composant**

Dans votre composant Angular, importez le module PrimeNG:

```typescript
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
```

#### 2️⃣ **Ajouter dans les `imports` du Composant**

Ajoutez les modules dans le tableau `imports`:

```typescript
@Component({
  selector: 'app-mon-composant',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,      // ✅ Ajoutez ici
    CardModule,        // ✅ Et ici
    InputTextModule    // ✅ Et ici
  ],
  template: `...`
})
```

#### 3️⃣ **Utiliser le Composant dans le Template**

Utilisez la balise HTML du composant:

```html
<!-- Bouton PrimeNG -->
<p-button label="Cliquez-moi" />

<!-- Card PrimeNG -->
<p-card>
  <h2>Contenu de la carte</h2>
</p-card>

<!-- Input Text PrimeNG -->
<input pInputText placeholder="Votre nom" />
```

---

## Exemples Concrets du Projet

### Exemple 1: Formulaire de Login

**Fichier: `src/app/features/auth/login/login.component.ts`**

#### Code Complet Annoté:

```typescript
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// ✅ ÉTAPE 1: Importer les modules PrimeNG nécessaires
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    // ✅ ÉTAPE 2: Ajouter les modules dans imports
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule
  ],
  providers: [MessageService], // Service pour les toasts
  template: `
    <!-- ✅ ÉTAPE 3: Utiliser les composants dans le template -->

    <!-- Card PrimeNG pour encadrer le formulaire -->
    <p-card class="w-full max-w-md shadow-lg">

      <!-- Header personnalisé avec ng-template -->
      <ng-template pTemplate="header">
        <div class="text-center py-4">
          <h1 class="text-3xl font-bold">Mantos</h1>
          <p>Mantis Issue Tracker</p>
        </div>
      </ng-template>

      <!-- Formulaire -->
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">

        <!-- Champ Username -->
        <div class="flex flex-col gap-2">
          <label for="username">Username</label>

          <!-- Input Text avec directive pInputText -->
          <input
            pInputText
            id="username"
            formControlName="username"
            placeholder="Enter your username"
            class="w-full"
          />
        </div>

        <!-- Champ Password -->
        <div class="flex flex-col gap-2">
          <label for="password">Password</label>

          <!-- Password Component avec toggle mask -->
          <p-password
            id="password"
            formControlName="password"
            placeholder="Enter your password"
            [toggleMask]="true"
            [feedback]="false"
            styleClass="w-full"
          />
        </div>

        <!-- Checkbox LDAP -->
        <div class="flex items-center gap-2">
          <p-checkbox
            formControlName="ldap"
            [binary]="true"
            inputId="ldap"
          />
          <label for="ldap">Use LDAP Authentication</label>
        </div>

        <!-- Bouton Submit -->
        <p-button
          type="submit"
          label="Sign In"
          [loading]="isLoading()"
          [disabled]="loginForm.invalid"
          styleClass="w-full"
          severity="primary"
        />
      </form>

      <!-- Footer personnalisé -->
      <ng-template pTemplate="footer">
        <p class="text-center text-sm text-gray-600">
          Contact your administrator if needed
        </p>
      </ng-template>

    </p-card>
  `
})
export class LoginComponent {
  private messageService = inject(MessageService);
  isLoading = signal(false);

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    ldap: [false]
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      // Afficher une notification de succès
      this.messageService.add({
        severity: 'success',
        summary: 'Login Successful',
        detail: 'Welcome back!',
        life: 3000
      });
    }
  }
}
```

#### 🔍 Détails des Composants Utilisés:

##### 1. **p-card** - Carte avec sections

```html
<p-card>
  <!-- Header personnalisé -->
  <ng-template pTemplate="header">
    <h1>Titre</h1>
  </ng-template>

  <!-- Contenu principal (par défaut) -->
  <p>Contenu</p>

  <!-- Footer personnalisé -->
  <ng-template pTemplate="footer">
    <p>Pied de page</p>
  </ng-template>
</p-card>
```

##### 2. **pInputText** - Input texte stylisé

```html
<!-- Directive appliquée à un input normal -->
<input
  pInputText
  type="text"
  placeholder="Votre texte"
  class="w-full"
/>
```

##### 3. **p-password** - Champ mot de passe

```html
<p-password
  formControlName="password"
  [toggleMask]="true"        <!-- Bouton pour montrer/cacher -->
  [feedback]="false"          <!-- Pas de barre de force -->
  placeholder="Password"
/>
```

##### 4. **p-checkbox** - Case à cocher

```html
<p-checkbox
  formControlName="ldap"
  [binary]="true"             <!-- Valeur true/false -->
  inputId="ldap"              <!-- ID pour le label -->
/>
<label for="ldap">Texte</label>
```

##### 5. **p-button** - Bouton stylisé

```html
<p-button
  type="submit"
  label="Sign In"             <!-- Texte du bouton -->
  [loading]="isLoading()"     <!-- État de chargement -->
  [disabled]="!form.valid"    <!-- Désactivé si invalide -->
  severity="primary"          <!-- Couleur: primary, success, danger, etc. -->
  styleClass="w-full"         <!-- Classes CSS personnalisées -->
/>
```

---

### Exemple 2: Menu et Avatar (Layout)

**Fichier: `src/app/shared/layout/layout.component.ts`**

```typescript
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  imports: [AvatarModule, MenuModule],
  template: `
    <!-- Avatar cliquable -->
    <p-avatar
      [label]="getUserInitials()"  <!-- Texte affiché (initiales) -->
      shape="circle"                <!-- Forme: circle ou square -->
      styleClass="bg-primary text-white cursor-pointer"
      (click)="userMenu.toggle($event)"  <!-- Ouvre le menu au clic -->
    />

    <!-- Menu contextuel (popup) -->
    <p-menu
      #userMenu                      <!-- Référence template -->
      [model]="userMenuItems"        <!-- Items du menu -->
      [popup]="true"                 <!-- Mode popup -->
      styleClass="w-48"
    />
  `
})
export class LayoutComponent {
  // Définition des items du menu
  userMenuItems: MenuItem[] = [
    {
      label: 'Profile',              // Texte
      icon: 'pi pi-user',            // Icône PrimeIcons
      command: () => this.goToProfile()  // Action au clic
    },
    {
      separator: true                // Ligne de séparation
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  getUserInitials(): string {
    return 'JD'; // Exemple: John Doe
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
  }
}
```

---

## Styling et Personnalisation

### 1. Classes CSS avec `styleClass`

Ajoutez des classes Tailwind ou custom:

```html
<p-button
  label="Mon Bouton"
  styleClass="w-full mt-4"  <!-- Classes Tailwind -->
/>
```

### 2. Styles Globaux pour PrimeNG

Dans le composant, utilisez `:host ::ng-deep`:

```typescript
@Component({
  styles: [`
    :host ::ng-deep {
      /* Personnaliser le bouton PrimeNG */
      .p-button {
        height: 3rem;
        font-weight: 600;
      }

      /* Personnaliser la card */
      .p-card {
        border-radius: 12px;
      }

      /* Personnaliser le focus des inputs */
      .p-inputtext:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
      }
    }
  `]
})
```

**⚠️ Note:** `::ng-deep` permet de cibler les éléments internes des composants PrimeNG.

### 3. Thème Sombre

Le thème sombre est configuré via `.dark-theme`:

```typescript
// Toggle dark mode
toggleTheme(): void {
  if (darkMode) {
    document.documentElement.classList.add('dark-theme');
  } else {
    document.documentElement.classList.remove('dark-theme');
  }
}
```

---

## Services PrimeNG

### MessageService - Notifications Toast

Le `MessageService` permet d'afficher des notifications.

#### Configuration:

```typescript
// Dans app.config.ts
import { MessageService } from 'primeng/api';

providers: [
  MessageService  // Service global
]
```

```typescript
// Dans app.ts (composant root)
import { ToastModule } from 'primeng/toast';

@Component({
  imports: [ToastModule],
  template: `
    <p-toast />  <!-- Composant toast global -->
    <router-outlet />
  `
})
```

#### Utilisation:

```typescript
export class MonComposant {
  private messageService = inject(MessageService);

  showSuccess(): void {
    this.messageService.add({
      severity: 'success',  // success, info, warn, error
      summary: 'Titre',     // Titre de la notification
      detail: 'Message',    // Détail du message
      life: 3000            // Durée en ms (3 secondes)
    });
  }

  showError(): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Une erreur est survenue',
      life: 5000
    });
  }
}
```

---

## Composants PrimeNG Courants

### Tableau Comparatif

| Composant | Module | Usage | Exemple |
|-----------|--------|-------|---------|
| Button | `ButtonModule` | Boutons stylisés | `<p-button label="Click" />` |
| Card | `CardModule` | Cartes avec header/footer | `<p-card>...</p-card>` |
| Input Text | `InputTextModule` | Champs texte | `<input pInputText />` |
| Password | `PasswordModule` | Champs mot de passe | `<p-password />` |
| Checkbox | `CheckboxModule` | Cases à cocher | `<p-checkbox [binary]="true" />` |
| Avatar | `AvatarModule` | Avatars utilisateur | `<p-avatar label="JD" />` |
| Menu | `MenuModule` | Menus contextuels | `<p-menu [model]="items" />` |
| Toast | `ToastModule` | Notifications | `<p-toast />` |
| Table | `TableModule` | Tableaux de données | `<p-table [value]="data" />` |
| Dialog | `DialogModule` | Modales | `<p-dialog [(visible)]="show">` |
| Dropdown | `DropdownModule` | Listes déroulantes | `<p-dropdown [options]="items" />` |

---

## Patterns Communs

### Pattern 1: Formulaire avec Validation

```typescript
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <!-- Champ avec validation -->
      <div>
        <label>Email</label>
        <input
          pInputText
          formControlName="email"
          [class.ng-invalid]="form.get('email')?.invalid && form.get('email')?.touched"
        />
        @if (form.get('email')?.invalid && form.get('email')?.touched) {
          <small class="text-red-500">Email invalide</small>
        }
      </div>

      <p-button
        type="submit"
        label="Envoyer"
        [disabled]="form.invalid"
      />
    </form>
  `
})
export class FormComponent {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit(): void {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
```

### Pattern 2: Liste avec Actions

```typescript
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  imports: [TableModule, ButtonModule],
  template: `
    <p-table [value]="items">
      <ng-template pTemplate="header">
        <tr>
          <th>Nom</th>
          <th>Actions</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-item>
        <tr>
          <td>{{ item.name }}</td>
          <td>
            <p-button
              icon="pi pi-pencil"
              (onClick)="edit(item)"
              severity="info"
              size="small"
            />
            <p-button
              icon="pi pi-trash"
              (onClick)="delete(item)"
              severity="danger"
              size="small"
            />
          </td>
        </tr>
      </ng-template>
    </p-table>
  `
})
export class ListComponent {
  items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ];

  edit(item: any): void {
    console.log('Edit', item);
  }

  delete(item: any): void {
    console.log('Delete', item);
  }
}
```

---

## Checklist pour Utiliser un Nouveau Composant

Quand vous voulez utiliser un nouveau composant PrimeNG:

- [ ] 1. Trouvez le composant dans la [documentation PrimeNG](https://primeng.org/)
- [ ] 2. Notez le nom du module (ex: `ButtonModule`)
- [ ] 3. Importez le module dans votre composant
- [ ] 4. Ajoutez-le dans le tableau `imports`
- [ ] 5. Utilisez la balise dans votre template
- [ ] 6. Consultez les propriétés disponibles (`[property]`) et événements (`(event)`)
- [ ] 7. Testez et personnalisez avec `styleClass` ou `::ng-deep`

---

## Ressources et Documentation

### Documentation Officielle
- **Site principal:** https://primeng.org/
- **Composants:** https://primeng.org/components
- **Thèmes:** https://primeng.org/theming

### PrimeIcons (Icônes)
- **Liste complète:** https://primeng.org/icons
- **Usage:** `<i class="pi pi-user"></i>`

### Exemples de Composants

#### Bouton avec Icône
```html
<p-button
  label="Nouveau"
  icon="pi pi-plus"
  iconPos="left"
  severity="success"
/>
```

#### Dialog (Modale)
```typescript
import { DialogModule } from 'primeng/dialog';

@Component({
  imports: [DialogModule],
  template: `
    <p-button label="Ouvrir" (onClick)="visible = true" />

    <p-dialog
      [(visible)]="visible"
      header="Titre de la modale"
      [modal]="true"
      [style]="{ width: '50vw' }"
    >
      <p>Contenu de la modale</p>

      <ng-template pTemplate="footer">
        <p-button label="Annuler" (onClick)="visible = false" severity="secondary" />
        <p-button label="Confirmer" (onClick)="confirm()" />
      </ng-template>
    </p-dialog>
  `
})
export class DialogExample {
  visible = false;

  confirm(): void {
    console.log('Confirmé');
    this.visible = false;
  }
}
```

#### Dropdown (Liste déroulante)
```typescript
import { DropdownModule } from 'primeng/dropdown';

@Component({
  imports: [DropdownModule, ReactiveFormsModule],
  template: `
    <p-dropdown
      [options]="cities"
      formControlName="city"
      placeholder="Sélectionnez une ville"
      optionLabel="name"
      optionValue="code"
    />
  `
})
export class DropdownExample {
  cities = [
    { name: 'Paris', code: 'PAR' },
    { name: 'Lyon', code: 'LYO' },
    { name: 'Marseille', code: 'MAR' }
  ];
}
```

---

## Conseils pour Débutants

### ✅ Bonnes Pratiques

1. **Toujours consulter la doc** - Chaque composant a sa page avec exemples
2. **Commencer simple** - Utilisez d'abord les props de base
3. **Tester progressivement** - Ajoutez les fonctionnalités une par une
4. **Utiliser styleClass** - Pour appliquer Tailwind CSS
5. **Signals pour l'état** - Préférez `signal()` aux variables classiques

### ❌ Erreurs Courantes

1. **Oublier d'importer le module** → Erreur "Component not found"
2. **Oublier provideAnimationsAsync()** → Composants cassés
3. **Mauvaise syntaxe des props** → `[property]` pour binding, `property="value"` pour string
4. **Accès localStorage en SSR** → Vérifier `isPlatformBrowser()`

### 🎯 Prochaines Étapes

1. Explorez la [documentation PrimeNG](https://primeng.org/)
2. Testez les composants dans un projet sandbox
3. Consultez le [showcase PrimeNG](https://primeng.org/showcase) pour voir tous les composants en action
4. Rejoignez le [Discord PrimeNG](https://discord.gg/gzKFYnpmCY) pour poser des questions

---

**Bonne chance avec PrimeNG! 🚀**
