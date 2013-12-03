"""
This script 'compiles' multiple text files into a single Javascript file
containing strings that represent each input file.

The goal is to store shader and model data in individual, easily editable
files, but still have the convenience of being able to load one big JavaScript
file and not need to worry about where those files come from.

To configure this script, just edit the OUTPUT_FILE and INPUT_FILES variables
at the top.
"""
import os

# save path
OUTPUT_FILE = "GameData.js"

# files that get compiled into javascript. text files only.
INPUT_FILES = [
    'vertex_shader.glsl',
    'fragment_shader.glsl',
    'FancyCube.obj',
    'teapot.obj',
    #'cube.obj',
    #'legoman.obj',
    #'legoman.mtl',
]

# Strip comments, blank lines, and leading/trailing whitespace from input files
# This should be set to False if debugging GLSL
STRIP_INPUT_DATA = True


def convertFile(fileName):
    output = []

    if not os.path.exists(fileName):
        raise IOError("Could not get file data for '%s'. File does not exist." % fileName)

    fileData = open(fileName, 'r')
    for line in fileData:
        if STRIP_INPUT_DATA:
            # skip blank lines
            if len(line.strip()) == 0:
                continue

            # strip comments from GLSL files
            if fileName.endswith(".glsl"):
                lineData = line.split("//")
                output.append('"%s\\n"' % lineData[0].strip())

            else:
                # strip comments from OBJ files
                if fileName.endswith(".obj") and line.strip().startswith("#"):
                    continue

                output.append('"%s\\n"' % line.strip())
        
        else:
            line = line.replace("\n", "\\n")
            line = line.replace("\r", "\\r")
            line = line.replace("\t", "\\t")
            output.append('"%s"' % line)

    # make sure an empty file wont break the resulting output
    if len(output) == 0:
        output.append('""')

    fileData.close()

    return "'%s':\n\t%s," % (fileName, " +\n\t".join(output))


def saveToFile(data, fileName):
    fp = open(fileName, 'w')
    fp.write(data)
    fp.close()


if __name__ == "__main__":
    # output data list. each list item is a line in the output file.
    output = [
        # Output file header
        "// This file is autogenerated. Please do not edit it, your changes will be lost.",
    ]

    # List all input files in the header for easy readability
    output.append("// This script contains the following files:")
    for fileName in INPUT_FILES:
        output.append("// - %s" % fileName)

    # start the javascript dict
    output.append("var DATA = {\n")

    # generate output and tack that onto the file
    for fileName in INPUT_FILES:
        print "Loading %s" % fileName
        try:
            fileData = convertFile(fileName)
        except IOError, e:
            print "ERROR: %s" % e
            fileData = "'%s':\n\t\"\"," % fileName
        output.append(fileData)

    # close the javascript dict
    output.append("\n};\n")

    # add function to test if the DATA object has a particular file
    output.append("""
DATA.hasFile = function(fileName) {
    return this.hasOwnProperty(fileName);
}
""")

    # add function to get a list of all files
    output.append("""
DATA.getFileList = function() {
    var keys = [];
    for (var key in DATA) {
        if (DATA.hasFile(key) && key != \"hasFile\" && key != \"getFileList\") {
            keys.push(key);
        }
    }
    return keys;
}
""")

    # save data
    print "\nSaving to %s" % OUTPUT_FILE
    saveToFile("\n".join(output), OUTPUT_FILE)

