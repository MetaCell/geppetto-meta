import os

YALE_FILES = "/home/afonso/Downloads/Files from Yale-20210511T111512Z-001/Files from Yale/Neuron OBJs"
counter = 0
total = 0
for filename in os.listdir(YALE_FILES):
    if filename.endswith(".obj"):
        size = os.path.getsize(os.path.join(YALE_FILES, filename))
        total += size
        counter += 1

print(total * 1.0 / counter)
