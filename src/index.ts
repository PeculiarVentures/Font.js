import * as exp from "./export";

function fix(obj: any) {
  for (const key in obj) {
    const data = obj[key];

    if (typeof data === "function") {
      if (data.prototype) {
        // class

        // static
        {
          const methods = Object.getOwnPropertyNames(data);
          for (const item of methods) {
            const descriptor = Object.getOwnPropertyDescriptor(data, item);
            if (descriptor && (descriptor.set || descriptor.get)) {
              if (descriptor.get) {
                const get = descriptor.get;
                console.log(`Wrap ${data.name}::${item} (get) static`);
                descriptor.get = function (this: any) {
                  console.log(`${data.name}::${item} (get) static`);

                  return get.call(this);
                };
              }
              if (descriptor.set) {
                const set = descriptor.set;
                console.log(`Wrap ${data.name}::${item} (set) static`);
                descriptor.set = function (this: any, value: any) {
                  console.log(`${data.name}::${item} (set) static`);

                  return set.call(this, value);
                };
              }
              continue;
            }
            const method = data[item];
            if (typeof method === "function") {
              if (item !== "constructor")
                console.log(`Wrap ${data.name}::${item} static`);
              data[item] = function (this: any, ...args: any[]) {
                console.log(`${data.name}::${item}`);

                return method.call(this, ...args);
              };
            }
          }
        }

        // prototype
        const methods = Object.getOwnPropertyNames(data.prototype);
        for (const item of methods) {
          const descriptor = Object.getOwnPropertyDescriptor(data.prototype, item);
          if (descriptor && (descriptor.set || descriptor.get)) {
            if (descriptor.get) {
              const get = descriptor.get;
              console.log(`Wrap ${data.name}::${item} (get)`);
              descriptor.get = function (this: any) {
                console.log(`${data.name}::${item} (get)`);

                return get.call(this);
              };
            }
            if (descriptor.set) {
              const set = descriptor.set;
              console.log(`Wrap ${data.name}::${item} (set)`);
              descriptor.set = function (this: any, value: any) {
                console.log(`${data.name}::${item} (set)`);

                return set.call(this, value);
              };
            }
            continue;
          }
          const method = data.prototype[item];
          if (typeof method === "function") {
            if (item !== "constructor")
              console.log(`Wrap ${data.name}::${item}`);
            data.prototype[item] = function (this: any, ...args: any[]) {
              console.log(`${data.name}::${item}`);

              return method.call(this, ...args);
            };
          }
        }
      } else {
        console.log(`Wrap ${key}`);
        obj[key] = function (...args: any[]) {
          console.log(`${key}`);

          return data.call(this, ...args);
        };
      }
    } else if (typeof data === "object") {
      // namespace
      fix(data);
    }

  }
}

// fix(exp);

export * from "./export";
