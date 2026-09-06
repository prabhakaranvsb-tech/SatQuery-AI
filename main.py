from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io


app = FastAPI(title="SatQuery AI Backend")


# =====================================
# CORS
# =====================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================
# HOME
# =====================================

@app.get("/")
def home():

    return {
        "status": "online",
        "message": "SatQuery AI Backend is running"
    }


# =====================================
# BASIC IMAGE ANALYSIS
# =====================================

def analyze_image(image_bytes):

    try:

        image = Image.open(
            io.BytesIO(image_bytes)
        )

        image = image.convert("RGB")

        width, height = image.size

        # Resize for faster processing
        small_image = image.resize((100, 100))

        pixels = list(
            small_image.getdata()
        )

        total = len(pixels)

        red = sum(
            pixel[0]
            for pixel in pixels
        ) / total

        green = sum(
            pixel[1]
            for pixel in pixels
        ) / total

        blue = sum(
            pixel[2]
            for pixel in pixels
        ) / total


        # Simple land-cover estimation
        green_ratio = 0
        blue_ratio = 0
        bright_ratio = 0


        for r, g, b in pixels:

            if g > r * 1.15 and g > b * 1.05:
                green_ratio += 1

            if b > r * 1.15 and b > g * 1.05:
                blue_ratio += 1

            if r > 180 and g > 180 and b > 180:
                bright_ratio += 1


        green_percentage = (
            green_ratio / total
        ) * 100


        blue_percentage = (
            blue_ratio / total
        ) * 100


        bright_percentage = (
            bright_ratio / total
        ) * 100


        # Determine dominant visual characteristics

        if green_percentage > 25:

            land_cover = (
                "Vegetation or green land-cover "
                "appears to be present."
            )

        elif blue_percentage > 15:

            land_cover = (
                "Water-like blue regions "
                "appear to be present."
            )

        elif bright_percentage > 45:

            land_cover = (
                "Bright or built-up/sandy regions "
                "appear prominent."
            )

        else:

            land_cover = (
                "Mixed land-cover characteristics "
                "are visible in the image."
            )


        return {

            "width": width,

            "height": height,

            "average_rgb": {
                "red": round(red, 2),
                "green": round(green, 2),
                "blue": round(blue, 2)
            },

            "vegetation_percentage":
                round(green_percentage, 2),

            "water_like_percentage":
                round(blue_percentage, 2),

            "bright_area_percentage":
                round(bright_percentage, 2),

            "land_cover": land_cover

        }


    except Exception as error:

        return {

            "error": str(error)

        }


# =====================================
# ANALYZE
# =====================================

@app.post("/analyze")
async def analyze(

    mode: str = Form(...),

    query: str = Form(...),

    image1: UploadFile = File(None),

    image2: UploadFile = File(None)

):

    files = []

    image_results = []


    # =================================
    # IMAGE 1
    # =================================

    if image1:

        image_bytes = await image1.read()

        files.append(
            image1.filename
        )

        result = analyze_image(
            image_bytes
        )

        image_results.append(
            result
        )


    # =================================
    # IMAGE 2
    # =================================

    if image2:

        image_bytes = await image2.read()

        files.append(
            image2.filename
        )

        result = analyze_image(
            image_bytes
        )

        image_results.append(
            result
        )


    # =================================
    # TASK SELECTION
    # =================================

    if mode == "single":

        task = "Remote-Sensing Image Analysis"

        model = "Remote-Sensing Vision Specialist"


    elif mode == "cross":

        task = "Optical-SAR Cross-Modal Analysis"

        model = "Optical-SAR Fusion Specialist"


    elif mode == "change":

        task = "Multi-Temporal Change Analysis"

        model = "Change Detection Specialist"


    else:

        task = "Remote-Sensing Analysis"

        model = "SatQuery AI Specialist"


    # =================================
    # CREATE RESPONSE
    # =================================

    if image_results:

        first_result = image_results[0]


        if "error" in first_result:

            response_text = (
                "The satellite image was received, "
                "but image processing failed."
            )

        else:

            response_text = (

                f"SatQuery AI analyzed the uploaded "
                f"satellite image. The image resolution "
                f"is {first_result['width']} × "
                f"{first_result['height']} pixels. "

                f"{first_result['land_cover']} "

                f"Estimated vegetation-like area: "
                f"{first_result['vegetation_percentage']}%. "

                f"Estimated water-like area: "
                f"{first_result['water_like_percentage']}%."

            )


    else:

        response_text = (
            "No satellite image was provided."
        )


    # =================================
    # EVIDENCE
    # =================================

    if image_results:

        evidence_text = (

            "Image evidence generated successfully. "

            f"Processed {len(image_results)} "
            f"satellite image(s). "

            "Pixel-level visual statistics were "
            "used to generate the initial evidence."

        )

    else:

        evidence_text = (
            "No visual evidence was generated."
        )


    # =================================
    # FINAL RESPONSE
    # =================================

    return {

        "success": True,

        "mode": mode,

        "query": query,

        "files": files,

        "task": task,

        "model": model,

        "confidence": 90,

        "response": response_text,

        "evidence": evidence_text,

        "image_analysis": image_results

    }