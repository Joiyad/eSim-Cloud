import os
from libAPI.models import Library, LibraryComponent
from django.core.management.base import BaseCommand
from libAPI.helper.main import generate_svg_and_save_to_folder
import logging
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "seed database for testing and development."

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true',
                            help="True to clear all libraries from DB")
        parser.add_argument('--location', type=self.dir_path,
                            help="Directory containing kicad library files")

    def dir_path(self, path):
        if os.path.isdir(path):
            return path
        else:
            raise Exception(f"{path} is not a valid path")

    def handle(self, *args, **options):
        self.stdout.write('seeding data...')
        if options['clear']:
            self.stdout.write('Deleting Objects')
            clear_data()
        if not options['location'] and not options['clear']:
            raise Exception('Argument location must be provided')
        elif not options['clear'] and options['location']:
            seed_libraries(self, options['location'])
        self.stdout.write('done.')


def clear_data():
    """Deletes all the table data"""
    Library.objects.all().delete()
    LibraryComponent.objects.all().delete()
    logger.info("Deleted All libraries and components")


def seed_libraries(self, location):
    logger.info(f"Reading libraries from {location}")
    for file in os.listdir(location):
        if '.lib' in file:
            self.stdout.write(f'Processing {file}')
            lib_location = os.path.join(location, file)
            lib_output_location = os.path.join(location, 'symbol_svgs')
            lib_type = generate_svg_and_save_to_folder(
                lib_location,
                lib_output_location
            )

            library = Library(
                library_name=file,
                library_type=lib_type
            )
            library.save()
            logger.info('Created Library Object')

            library_svg_folder = os.path.join(lib_output_location, file[:-4])
            for component_svg in os.listdir(library_svg_folder):
                component = LibraryComponent(
                    component_name=component_svg[:-4],
                    svg_path=os.path.join(library_svg_folder, component_svg),
                    component_type=lib_type,
                    component_library=library
                )
                component.save()
                logger.info(f'Saved component {component_svg}')
