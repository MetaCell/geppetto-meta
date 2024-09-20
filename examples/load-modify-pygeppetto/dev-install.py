from subprocess import run
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
FRONTEND_FOLDER = HERE / "frontend"
BACKEND_FOLDER = HERE / "backend"


# Simple helper for easily creating command
class Command(object):
    def __init__(self, exec=None, parent_cmd=None):
        self.exec = exec
        self.parent_cmd = parent_cmd
        self.args = []

    def __getattr__(self, name):
        return Command(name, parent_cmd=self)

    def _build_command(self):
        final_cmd = []
        current = self
        while current and current is not sh:
            final_cmd.extend(current.args[::-1])
            final_cmd.append(current.exec)
            current = current.parent_cmd
        return final_cmd[::-1]

    def __call__(self, *args, stdin=None, capture_output=False):
        final_cmd = self._build_command()
        final_cmd.extend(args)
        return run(final_cmd, capture_output=capture_output, check=True, input=stdin)

    def __getitem__(self, keys):
        if isinstance(keys, tuple):
            self.args.extend(keys)
        else:
            self.args.append(keys)
        return self


sh = Command()


def in_venv():
    return f"{Path(sys.executable).parent}" not in ["/usr/bin", "/usr/local/bin"]


def check_venv_activate():
    if not in_venv():
        print(
            "You are not in a virtualenv, please initialise and activate a python>=3.10 venv before running this script"
        )
        sys.exit(1)


def generate_run_server_script():
    (HERE / "run-backend.bash").write_text(
        """
#!/usr/bin/env bash

# Trick to have folder relative to the script, not CWD
PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "${PARENT_PATH}"

(cd backend && fastapi dev pygeppetto_api)
"""
    )


def generate_run_frontend_script():
    (HERE / "run-frontend.bash").write_text(
        """#!/usr/bin/env bash

# Trick to have folder relative to the script, not CWD
PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "${PARENT_PATH}"

(cd frontend && yarn dev)
"""
    )


def generate_gen_binding_script():
    (HERE / "generate-binding.bash").write_text(
        """#!/usr/bin/env bash

# Trick to have folder relative to the script, not CWD
PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "${PARENT_PATH}"

# Generates the openAPI specification
(cd backend && python genopenapi.py)

# Generates the typescript API binding
(cd frontend && yarn generate-client)
"""
    )


def generate_watch_script():
    (HERE / "watch.bash").write_text(
        """#!/usr/bin/env bash

# Trick to have folder relative to the script, not CWD
PARENT_PATH=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "${PARENT_PATH}"

function trigger_on_change () {
  FILE="$1"
  CMD="$2"
  echo "Watching for modifications on ${PARENT_PATH}/${FILE}..."
  LAST=`md5sum "$FILE"`
  while true; do
    sleep 1
    NEW=$(md5sum "$FILE")
    if [ "$NEW" != "$LAST" ]; then
      "$CMD"
      LAST="$NEW"
    fi
  done
}

function generate_binding () {
  echo " => API definition has changed, regenerating the typescript client"
  bash generate-binding.bash
}

trigger_on_change "backend/pygeppetto_api/api.py" generate_binding
"""
    )


def generate_run_scripts():
    generate_run_server_script()
    generate_run_frontend_script()
    generate_gen_binding_script()
    generate_watch_script()


def install_backend_dependencies():
    sh.pip.install("-r", BACKEND_FOLDER / "requirements.txt")


def install_frontend_dependencies():
    sh.yarn("--cwd", FRONTEND_FOLDER, "install")


if __name__ == "__main__":
    check_venv_activate()
    install_backend_dependencies()
    install_frontend_dependencies()

    generate_run_scripts()
