import logging

logger = logging.getLogger(__name__)

class DesignManager:
    def __init__(self):
        self.tshirt_color = "white"
        self.logos = []

    def set_tshirt_color(self, color):
        logger.debug(f"Setting T-shirt color to {color}")
        self.tshirt_color = color

    def add_logo(self, logo_url):
        logger.debug(f"Adding logo: {logo_url}")
        self.logos.append(logo_url)

    def remove_logo(self, logo_url):
        logger.debug(f"Removing logo: {logo_url}")
        if logo_url in self.logos:
            self.logos.remove(logo_url)

    def get_design(self):
        logger.debug("Fetching current design")
        return {
            "color": self.tshirt_color,
            "logos": self.logos
        }

    def generate_preview(self):
        logger.debug("Generating T-shirt preview")
        # Placeholder logic for generating a preview
        return f"Preview of T-shirt with color {self.tshirt_color} and logos {self.logos}"

# Example usage
if __name__ == "__main__":
    manager = DesignManager()
    manager.set_tshirt_color("blue")
    manager.add_logo("https://example.com/logo1.png")
    manager.add_logo("https://example.com/logo2.png")
    print(manager.get_design())
    print(manager.generate_preview())
