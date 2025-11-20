#!/usr/bin/env python3
"""
Скрипт для конвертации изображений в WebP формат с оптимизацией.
Поддерживает JPG, JPEG, PNG форматы.
Создает WebP версии в той же директории с сохранением оригиналов.
"""

import os
import sys
from pathlib import Path
from PIL import Image

# Настройки конвертации
QUALITY = 85  # Качество WebP (0-100, рекомендуется 80-90)
SUPPORTED_FORMATS = {'.jpg', '.jpeg', '.png'}
OUTPUT_DIR = None  # None = сохранять в той же директории, что и оригинал


def convert_image_to_webp(image_path: Path, quality: int = QUALITY, output_dir: Path = None) -> bool:
    """
    Конвертирует изображение в WebP формат.
    
    Args:
        image_path: Путь к исходному изображению
        quality: Качество WebP (0-100)
        output_dir: Директория для сохранения (None = та же, что у оригинала)
    
    Returns:
        bool: True если конвертация успешна, False в противном случае
    """
    try:
        # Открываем изображение
        with Image.open(image_path) as img:
            # Определяем путь для сохранения
            if output_dir:
                output_path = output_dir / f"{image_path.stem}.webp"
            else:
                output_path = image_path.parent / f"{image_path.stem}.webp"
            
            # Конвертируем RGBA в RGB если необходимо
            if img.mode in ('RGBA', 'LA', 'P'):
                # Создаем белый фон для прозрачных изображений
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Сохраняем в WebP
            img.save(output_path, 'WEBP', quality=quality, method=6)
            
            # Информация о размерах файлов
            original_size = image_path.stat().st_size
            webp_size = output_path.stat().st_size
            reduction = ((original_size - webp_size) / original_size) * 100
            
            print(f"✓ {image_path.name} -> {output_path.name}")
            print(f"  Оригинал: {original_size / 1024:.1f} KB | WebP: {webp_size / 1024:.1f} KB | Сжатие: {reduction:.1f}%")
            
            return True
            
    except Exception as e:
        print(f"✗ Ошибка при конвертации {image_path.name}: {e}")
        return False


def process_directory(directory: Path, quality: int = QUALITY, output_dir: Path = None, recursive: bool = False):
    """
    Обрабатывает все изображения в директории.
    
    Args:
        directory: Директория с изображениями
        quality: Качество WebP (0-100)
        output_dir: Директория для сохранения WebP файлов
        recursive: Обрабатывать поддиректории рекурсивно
    """
    if not directory.exists():
        print(f"✗ Директория не найдена: {directory}")
        return
    
    # Создаем output директорию если указана
    if output_dir:
        output_dir.mkdir(parents=True, exist_ok=True)
    
    # Собираем все файлы изображений
    if recursive:
        image_files = [
            f for f in directory.rglob('*')
            if f.suffix.lower() in SUPPORTED_FORMATS and not f.name.endswith('.Zone.Identifier')
        ]
    else:
        image_files = [
            f for f in directory.iterdir()
            if f.is_file() and f.suffix.lower() in SUPPORTED_FORMATS and not f.name.endswith('.Zone.Identifier')
        ]
    
    if not image_files:
        print(f"✗ Изображения не найдены в {directory}")
        return
    
    print(f"\n🔄 Найдено {len(image_files)} изображений для конвертации")
    print(f"📁 Директория: {directory}")
    print(f"⚙️  Качество: {quality}")
    print("-" * 60)
    
    # Конвертируем изображения
    success_count = 0
    total_original_size = 0
    total_webp_size = 0
    
    for image_path in image_files:
        original_size = image_path.stat().st_size
        total_original_size += original_size
        
        if convert_image_to_webp(image_path, quality, output_dir):
            success_count += 1
            
            # Рассчитываем размер WebP файла
            if output_dir:
                webp_path = output_dir / f"{image_path.stem}.webp"
            else:
                webp_path = image_path.parent / f"{image_path.stem}.webp"
            
            if webp_path.exists():
                total_webp_size += webp_path.stat().st_size
        
        print()  # Пустая строка между файлами
    
    # Итоговая статистика
    print("-" * 60)
    print(f"✓ Успешно конвертировано: {success_count}/{len(image_files)}")
    
    if total_webp_size > 0:
        total_reduction = ((total_original_size - total_webp_size) / total_original_size) * 100
        print(f"📊 Общий размер:")
        print(f"   Оригиналы: {total_original_size / 1024:.1f} KB")
        print(f"   WebP: {total_webp_size / 1024:.1f} KB")
        print(f"   Сэкономлено: {(total_original_size - total_webp_size) / 1024:.1f} KB ({total_reduction:.1f}%)")


def main():
    """Основная функция с обработкой аргументов командной строки."""
    print("=" * 60)
    print("🖼️  Конвертер изображений в WebP")
    print("=" * 60)
    
    # Проверяем наличие Pillow
    try:
        from PIL import Image
    except ImportError:
        print("✗ Ошибка: Требуется установить библиотеку Pillow")
        print("  Выполните: pip install Pillow")
        sys.exit(1)
    
    # Определяем директорию для обработки
    if len(sys.argv) > 1:
        directory = Path(sys.argv[1])
    else:
        # По умолчанию - папка assets/images
        directory = Path(__file__).parent / "assets" / "images"
    
    # Качество (опционально)
    quality = int(sys.argv[2]) if len(sys.argv) > 2 else QUALITY
    
    # Рекурсивная обработка (опционально)
    recursive = '--recursive' in sys.argv or '-r' in sys.argv
    
    # Обрабатываем директорию
    process_directory(directory, quality, OUTPUT_DIR, recursive)
    
    print("\n✅ Готово!")


if __name__ == "__main__":
    main()

# Обработать assets/images (по умолчанию)
# python convert_to_webp.py

# Обработать конкретную папку
# python convert_to_webp.py "путь/к/папке"

# С настройкой качества (0-100)
# python convert_to_webp.py "assets/images" 90

# Рекурсивно (все подпапки)
# python convert_to_webp.py "assets/images" 85 --recursive