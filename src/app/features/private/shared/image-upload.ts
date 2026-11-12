import { Component, computed, inject, input, model, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FilesService, UploadFolder } from '../../../core/services/files.service';
import { apiErrorMessage } from './admin-utils';

/** Picture picker: uploads the chosen file right away and exposes the stored path. */
@Component({
  selector: 'app-image-upload',
  imports: [ButtonModule],
  template: `
    <div class="image-upload">
      <div class="image-upload__preview" [class.is-round]="round()">
        @if (previewUrl(); as url) {
          <img [src]="url" alt="Aperçu" />
        } @else {
          <i class="pi pi-image"></i>
        }
      </div>
      <div class="image-upload__actions">
        <input #fileInput type="file" accept="image/png,image/jpeg,image/webp" hidden (change)="onFileSelected(fileInput)" />
        <p-button size="small" [outlined]="true" icon="pi pi-upload" [label]="path() ? 'Remplacer' : 'Choisir une image'"
                  [loading]="uploading()" (onClick)="fileInput.click()" />
        @if (path()) {
          <p-button size="small" [text]="true" severity="danger" icon="pi pi-times" label="Retirer" (onClick)="path.set(null)" />
        }
        <small class="image-upload__hint">JPEG, PNG ou WEBP, 5 Mo maximum.</small>
        @if (error()) {
          <small class="image-upload__error">{{ error() }}</small>
        }
      </div>
    </div>
  `
})
export class ImageUploadComponent {
  private readonly filesService = inject(FilesService);

  readonly folder = input<UploadFolder>('misc');
  readonly round = input(false);
  /** Stored path (two-way bound). */
  readonly path = model<string | null | undefined>(null);

  protected readonly uploading = signal(false);
  protected readonly error = signal('');
  protected readonly previewUrl = computed(() => this.filesService.imageUrl(this.path()));

  protected onFileSelected(inputElement: HTMLInputElement): void {
    const file = inputElement.files?.[0];
    inputElement.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('Image trop lourde (5 Mo maximum).');
      return;
    }
    this.error.set('');
    this.uploading.set(true);
    this.filesService.uploadImage(file, this.folder()).subscribe({
      next: ({ path }) => {
        this.path.set(path);
        this.uploading.set(false);
      },
      error: (err) => {
        this.error.set(apiErrorMessage(err, "Échec de l'envoi de l'image."));
        this.uploading.set(false);
      }
    });
  }
}
